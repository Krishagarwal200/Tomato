import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Stripe from "stripe";

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
    // Initialize Stripe inside the function
    const stripe = getStripe();

    const { items, amount, address, paymentMethod } = req.body;
    const userId = req.userId;

    console.log("🟡 Placing order for user:", userId);
    console.log("🟡 Payment method:", paymentMethod);
    console.log("🟡 Order amount:", amount);

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid order amount is required",
      });
    }

    if (
      !address ||
      !address.name ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zipCode ||
      !address.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete address information is required",
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

    // Create order
    const order = new Order({
      user: userId,
      items: items,
      address: address,
      amount: amount,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "pending" : "pending",
      orderStatus: "pending",
    });

    const savedOrder = await order.save();
    console.log("✅ Order created:", savedOrder._id);

    // Handle different payment methods
    if (paymentMethod === "cash") {
      // For cash on delivery, order is placed directly
      // Clear user's cart after successful order placement
      user.cartData = new Map();
      await user.save();
      console.log("✅ Cart cleared for user:", userId);

      return res.status(201).json({
        success: true,
        message: "Order placed successfully. You will pay cash on delivery.",
        order: {
          id: savedOrder._id,
          orderNumber: savedOrder.orderNumber,
          amount: savedOrder.amount,
          items: savedOrder.items,
          address: savedOrder.address,
          orderStatus: savedOrder.orderStatus,
          paymentMethod: savedOrder.paymentMethod,
        },
      });
    } else if (paymentMethod === "card" || paymentMethod === "upi") {
      // For online payments, create Stripe checkout session

      // Prepare line items for Stripe
      const line_items = items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [`${backend_url}/images/${item.image}`],
            metadata: {
              foodId: item.foodId,
            },
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

      // Add tax as a separate line item
      const taxAmount =
        amount -
        (items.reduce((sum, item) => sum + item.price * item.quantity, 0) + 5);
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

      console.log("🟡 Creating Stripe checkout session...");

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: paymentMethod === "upi" ? ["card"] : ["card"],
        line_items: line_items,
        mode: "payment",
        success_url: `${frontend_url}/verify?success=true&orderId=${savedOrder._id}`,
        cancel_url: `${frontend_url}/verify?success=false&orderId=${savedOrder._id}`,
        customer_email: user.email,
        client_reference_id: savedOrder._id.toString(),
        metadata: {
          orderId: savedOrder._id.toString(),
          userId: userId.toString(),
          paymentMethod: paymentMethod,
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: 500, // $5.00 in cents
                currency: "usd",
              },
              display_name: "Delivery fee",
            },
          },
        ],
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "IN"],
        },
        custom_text: {
          shipping_address: {
            message: "Note: We'll deliver your order to this address.",
          },
        },
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

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, sessionId } = req.body;
    const userId = req.userId;

    console.log("🟡 Verifying payment for order:", orderId);

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
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check Stripe session status directly
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("🟡 Stripe session status:", session.status);
    console.log("🟡 Stripe payment status:", session.payment_status);

    if (session.payment_status === "paid") {
      // Payment successful
      order.paymentStatus = "completed";
      order.orderStatus = "confirmed";
      order.stripePaymentIntentId = session.payment_intent;

      // Clear user's cart
      const user = await User.findById(userId);
      if (user) {
        user.cartData = new Map();
        await user.save();
        console.log("✅ Cart cleared for user:", userId);
      }

      await order.save();

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
        },
      });
    } else {
      // Payment failed or not completed
      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";
      await order.save();

      console.log("❌ Payment not completed for order:", orderId);

      return res.status(400).json({
        success: false,
        message: "Payment not completed. Please try again.",
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
        },
      });
    }
  } catch (error) {
    console.error("❌ Verify payment error:", error);

    // Handle Stripe errors
    if (error.type?.startsWith("Stripe")) {
      return res.status(400).json({
        success: false,
        message: "Error verifying payment with Stripe",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Webhook handler (if you decide to use webhooks later)
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`❌ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`🟡 Webhook received: ${event.type}`);
  res.json({ received: true });
};

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
