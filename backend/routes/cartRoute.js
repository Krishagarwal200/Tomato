import express from "express";

import authMiddleware from "../middleware/auth.js";
import {
  addToCart,
  decreaseCartItem,
  getCartItems,
  removeFromCart,
} from "../controllers/CartController.js";

const cartRouter = express.Router();

// All cart routes require authentication
cartRouter.use(authMiddleware);

cartRouter.post("/add", addToCart);
cartRouter.put("/decrease", decreaseCartItem);
cartRouter.get("/", getCartItems);
cartRouter.delete("/remove", removeFromCart);
export default cartRouter;
