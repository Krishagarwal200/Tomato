import express from "express";
import {
  addToCart,
  removeFromCart,
  getCart,
  // updateCartItem,
  // clearCart,
} from "../controllers/CartController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/add", authMiddleware, addToCart);
router.post("/remove", authMiddleware, removeFromCart);
// router.post("/update", authMiddleware, updateCartItem);
router.get("/", authMiddleware, getCart);
// router.delete("/clear", authMiddleware, clearCart);

export default router;
