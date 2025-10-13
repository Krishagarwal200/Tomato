import express from "express";
import {
  storeRegister,
  storeLogin,
  getAllStores, // Add this
} from "../controllers/storeController.js";
import { getStoreById } from "../controllers/storeController.js";
import { getStoreItems } from "../controllers/storeController.js";

const router = express.Router();

// Public routes
router.post("/register", storeRegister);
router.post("/login", storeLogin);
router.get("/", getAllStores); // Add this route to get all stores
// Add these routes
router.get("/:storeId", getStoreById); // Get store by ID
router.get("/:storeId/items", getStoreItems); // Get store items
export default router;
