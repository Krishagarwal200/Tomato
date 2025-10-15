// routes/storeOrderRoutes.js
import express from "express";
import {
  getStoreOrders,
  updateOrderStatus,
  getStoreStats,
} from "../controllers/storeOrderController.js";
import storeAuth from "../middleware/storeAuth.js";

const StoreOrderRouter = express.Router();

// All routes protected with store authentication
StoreOrderRouter.get("/orders", storeAuth, getStoreOrders);
StoreOrderRouter.put("/:orderId/status", storeAuth, updateOrderStatus);
StoreOrderRouter.get("/stats", storeAuth, getStoreStats);

export default StoreOrderRouter;
