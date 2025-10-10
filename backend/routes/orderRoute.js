// routes/orderRoute.js
import express from "express";
import {
  listOrders,
  placeOrder,
  updateOrderStatus,
  userOrders,
  verifyOrder,
} from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/place", authMiddleware, placeOrder);
router.post("/verify", authMiddleware, verifyOrder);
router.post("/userorders", authMiddleware, userOrders);
router.get("/list", listOrders);
router.post("/update-status", updateOrderStatus);
export default router;
