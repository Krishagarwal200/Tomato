import express from "express";
import {
  storeRegister,
  storeLogin,
  getAllStores, // Add this
} from "../controllers/storeController.js";
import { getStoreById } from "../controllers/storeController.js";
import { getStoreItems } from "../controllers/storeController.js";
import storeAuth from "../middleware/storeAuth.js";
const storeRouter = express.Router();
storeRouter.get("/profile", storeAuth, (req, res) => {
  res.json({
    success: true,
    store: req.store,
  });
});

// Public routes
storeRouter.post("/register", storeRegister);
storeRouter.post("/login", storeLogin);
storeRouter.get("/", getAllStores); // Add this route to get all stores
// Add these routes
storeRouter.get("/:storeId", getStoreById); // Get store by ID
storeRouter.get("/:storeId/items", getStoreItems); // Get store items
export default storeRouter;
