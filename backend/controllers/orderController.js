import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

export const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5174";

  try {
    // Check if Stripe secret key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Stripe secret key is missing from environment variables");
      return res.status(500).json({
        success: false,
        message: "Payment system configuration error",
      });
    }

    // Initialize Stripe INSIDE the function to ensure it has the environment variables
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    console.log("Stripe initialized successfully");

    const { items, address, amount } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!address || !amount) {
      return res.status(400).json({
        success: false,
        message: "Address and amount are required",
      });
    }

    // Validate individual items
    for (const item of items) {
      if (!item.name || item.price === undefined || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Invalid item data: ${JSON.stringify(item)}`,
        });
      }
    }

    // Create new order with payment false initially
    const newOrder = new orderModel({
      userId: userId,
      items: items,
      address: address,
      amount: amount,
      status: "Food Processing",
      payment: false,
    });

    await newOrder.save();
    console.log("Order saved with ID:", newOrder._id);

    // Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    console.log("User cart cleared");

    // Validate and create Stripe line items
    const line_items = items.map((item) => {
      const unit_amount = Math.round(Number(item.price) * 100);

      // Stripe requires minimum amount of 50 paise (0.50 INR) for INR
      if (unit_amount < 50) {
        throw new Error(
          `Price too low for item: ${item.name}. Minimum is 0.50 INR`
        );
      }

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name.substring(0, 100),
          },
          unit_amount: unit_amount,
        },
        quantity: Math.max(1, Number(item.quantity)),
      };
    });

    // Add delivery fee
    if (amount > 0) {
      line_items.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Delivery Fee",
          },
          unit_amount: 200,
        },
        quantity: 1,
      });
    }

    console.log("Creating Stripe session with", line_items.length, "items");

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId,
      },
    });

    console.log("Stripe session created successfully:", session.id);

    res.json({
      success: true,
      session_url: session.url,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Place order error:", error);

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
        message: `Payment error: ${error.message}`,
        stripeError: error.type,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  try {
    // Validate input
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Convert string to boolean properly
    const isSuccess = success === "true" || success === true;

    if (isSuccess) {
      // Update order to mark as paid
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        {
          payment: true,
          status: "Food Processing",
        },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "Payment confirmed successfully",
        order: updatedOrder,
      });
    } else {
      // Delete the order on payment failure
      await orderModel.findByIdAndDelete(orderId);

      res.json({
        success: false,
        message: "Order cancelled due to payment failure",
      });
    }
  } catch (error) {
    console.error("Verify order error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await orderModel.find({ userId: userId });
    res.json({
      success: true,
      data: orders, // Change from 'orders' to 'data'
    });
  } catch (error) {
    console.error("User orders error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find();
    res.json({
      success: true,
      data: orders, // Change from 'orders' to 'data'
    });
  } catch (error) {
    console.error("Admin orders error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      {
        status: status,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
