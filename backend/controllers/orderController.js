import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Stripe from "stripe";
import Store from "../models/storeModel.js";
// Helper function to get Stripe instance
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not defined in environment variables"
    );
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia",
  });
};

const frontend_url = process.env.FRONTEND_URL || "http://localhost:5174";
const backend_url = process.env.BACKEND_URL || "http://localhost:4000";
export const placeOrder = async (req, res) => {
  try {
    const { items, amount, address, paymentMethod } = req.body;
    const userId = req.userId;

    console.log("🟡 Placing order for user:", userId);

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    // Get store ID from the first item
    const storeId = items[0]?.storeId;
    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store information is required",
      });
    }

    // Verify store exists and is active
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    if (!store.isActive) {
      return res.status(400).json({
        success: false,
        message: "This store is currently inactive",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create order with store reference
    const order = new Order({
      user: userId,
      store: storeId,
      items: items,
      address: address,
      amount: amount,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "pending" : "pending",
      orderStatus: "pending",
    });

    const savedOrder = await order.save();
    console.log("✅ Order created:", savedOrder._id, "for store:", store.name);

    // Clear user's cart
    user.cartData = new Map();
    await user.save();
    console.log("✅ Cart cleared for user:", userId);

    // Handle payment methods
    if (paymentMethod === "cash") {
      return res.status(201).json({
        success: true,
        message: "Order placed successfully. You will pay cash on delivery.",
        order: {
          id: savedOrder._id,
          orderNumber: savedOrder.orderNumber,
          amount: savedOrder.amount,
          store: {
            id: store._id,
            name: store.name,
          },
        },
      });
    } else if (paymentMethod === "card" || paymentMethod === "upi") {
      // For online payments - create Stripe checkout session
      const stripe = getStripe();

      // Prepare line items for Stripe - SIMPLIFIED VERSION
      const line_items = items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            // No images or metadata to avoid Stripe errors
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      // Add delivery fee as a separate line item
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Delivery Fee",
          },
          unit_amount: 500, // $5.00 in cents
        },
        quantity: 1,
      });

      // Add tax as a separate line item if applicable
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const taxAmount = amount - (subtotal + 5);
      if (taxAmount > 0) {
        line_items.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: "Tax",
            },
            unit_amount: Math.round(taxAmount * 100),
          },
          quantity: 1,
        });
      }

      console.log("🟡 Creating Stripe checkout session for store:", store.name);

      // Create Stripe checkout session with proper string metadata
      // Create Stripe checkout session - MINIMAL VERSION
      const session = await stripe.checkout.sessions.create({
        payment_method_types: paymentMethod === "upi" ? ["card"] : ["card"],
        line_items: line_items,
        mode: "payment",
        success_url: `${frontend_url}/verify?success=true&orderId=${savedOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontend_url}/verify?success=false&orderId=${savedOrder._id}`,
        customer_email: user.email,
        client_reference_id: savedOrder._id.toString(),
        metadata: {
          orderId: savedOrder._id.toString(),
          userId: userId.toString(),
          storeId: storeId.toString(),
          paymentMethod: paymentMethod,
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: 500,
                currency: "usd",
              },
              display_name: "Delivery fee",
            },
          },
        ],
        // Remove custom_text entirely to avoid any issues
      });
      console.log("✅ Stripe session created successfully:", session.id);

      // Update order with Stripe session ID
      savedOrder.stripeSessionId = session.id;
      await savedOrder.save();

      res.json({
        success: true,
        session_url: session.url,
        sessionId: session.id,
        orderId: savedOrder._id,
        store: {
          id: store._id,
          name: store.name,
        },
        message: "Redirect to payment gateway",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }
  } catch (error) {
    console.error("❌ Place order error:", error);

    // Handle Stripe-specific errors
    if (error.type?.startsWith("Stripe")) {
      console.error("Stripe API Error:", {
        type: error.type,
        code: error.code,
        message: error.message,
        param: error.param,
      });

      return res.status(400).json({
        success: false,
        message: "Payment processing error",
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order data",
        error: error.message,
      });
    }

    // Handle duplicate order number
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Order number conflict. Please try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
const handleOnlinePayment = async (
  order,
  user,
  items,
  amount,
  paymentMethod,
  res
) => {
  try {
    const stripe = getStripe();

    // Prepare line items quickly
    const line_items = [
      ...items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            // Remove images if they're causing delays
            // images: [`${backend_url}/images/${item.image}`],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Delivery Fee" },
          unit_amount: 500,
        },
        quantity: 1,
      },
    ];

    // Add tax if needed
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const taxAmount = amount - (subtotal + 5);
    if (taxAmount > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Tax" },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      });
    }

    console.log("🟡 Creating Stripe checkout session...");

    // Create Stripe session with timeout
    const session = await Promise.race([
      stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: line_items,
        mode: "payment",
        success_url: `${frontend_url}/verify?success=true&orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontend_url}/verify?success=false&orderId=${order._id}`,
        customer_email: user.email,
        metadata: {
          orderId: order._id.toString(),
          userId: user._id.toString(),
        },
        // Remove optional features to speed up
        // shipping_address_collection: {
        //   allowed_countries: ['US', 'CA', 'IN'],
        // },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Stripe timeout")), 10000)
      ),
    ]);

    console.log("✅ Stripe session created:", session.id);

    // Update order with session ID
    order.stripeSessionId = session.id;
    await order.save();

    res.json({
      success: true,
      session_url: session.url,
      sessionId: session.id,
      orderId: order._id,
    });
  } catch (error) {
    console.error("❌ Online payment handling error:", error);

    // If Stripe fails, mark order as failed but don't delete it
    order.paymentStatus = "failed";
    order.orderStatus = "cancelled";
    await order.save();

    if (error.message === "Stripe timeout") {
      return res.status(408).json({
        success: false,
        message: "Payment service timeout. Please try again.",
      });
    }

    res.status(400).json({
      success: false,
      message: "Failed to initialize payment",
      error: error.message,
    });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, sessionId } = req.body;
    const userId = req.userId;

    console.log("🔍 VERIFY PAYMENT DEBUG:");
    console.log("Order ID:", orderId);
    console.log("Session ID:", sessionId);
    console.log("User ID:", userId);

    if (!orderId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Session ID are required",
      });
    }

    // Initialize Stripe
    const stripe = getStripe();

    // Find the order
    const order = await Order.findOne({ _id: orderId, user: userId });
    console.log("🔍 Order found:", order ? "Yes" : "No");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log("🔍 Current order status:", {
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      stripeSessionId: order.stripeSessionId,
    });

    // Check Stripe session status directly
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    console.log("🔍 Stripe session details:", {
      status: session.status,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent?.status,
    });

    if (session.payment_status === "paid") {
      console.log("💰 Payment is PAID - updating order status...");

      // Payment successful
      order.paymentStatus = "completed";
      order.orderStatus = "confirmed";
      order.stripePaymentIntentId = session.payment_intent;
      order.stripeSessionId = sessionId;

      // Double-check user exists and clear cart
      const user = await User.findById(userId);
      if (user) {
        console.log("🔍 User cart before clear:", user.cartData);
        user.cartData = new Map();
        await user.save();

        // Verify cart was cleared
        const updatedUser = await User.findById(userId);
        console.log("🔍 User cart after clear:", updatedUser.cartData);
        console.log("✅ Cart cleared for user:", userId);
      } else {
        console.log("❌ User not found when trying to clear cart");
      }

      await order.save();

      // Verify order was updated
      const updatedOrder = await Order.findById(orderId);
      console.log("🔍 Order after update:", {
        paymentStatus: updatedOrder.paymentStatus,
        orderStatus: updatedOrder.orderStatus,
      });

      console.log("✅ Payment verified successfully for order:", orderId);

      return res.status(200).json({
        success: true,
        message: "Payment successful! Your order has been confirmed.",
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          amount: order.amount,
          items: order.items,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          address: order.address,
        },
      });
    } else {
      console.log("❌ Payment status is:", session.payment_status);
      // Handle other statuses...
    }
  } catch (error) {
    console.error("❌ Verify payment error:", error);
    // Error handling...
  }
};

// Webhook handler (if you decide to use webhooks later)

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("❌ Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single order details
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("❌ Get order details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Add to your orderController.js temporarily
export const testClearCart = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    console.log("🔍 Cart before clear:", user.cartData);
    user.cartData = new Map();
    await user.save();

    const updatedUser = await User.findById(userId);
    console.log("🔍 Cart after clear:", updatedUser.cartData);

    res.json({
      success: true,
      message: "Cart cleared manually",
      cartBefore: user.cartData,
      cartAfter: updatedUser.cartData,
    });
  } catch (error) {
    console.error("Test clear cart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
