import express from "express";
import {
  placeOrder,
  getUserOrders,
  getOrderDetails,
  verifyPayment,
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const orderRouter = express.Router();

// Webhook route (must be before body parser middleware)
// orderRouter.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   stripeWebhook
// );

// Protected routes
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", authMiddleware, verifyPayment);
orderRouter.get("/user-orders", authMiddleware, getUserOrders);
orderRouter.get("/:orderId", authMiddleware, getOrderDetails);

export default orderRouter;
