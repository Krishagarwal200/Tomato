// middleware/storeAuthMiddleware.js
import jwt from "jsonwebtoken";
import Store from "../models/storeModel.js";

// middleware/storeAuthMiddleware.js - CORRECTED VERSION
const storeAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token, authorization denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make sure we're getting the store ID correctly
    console.log("🔵 Decoded token:", decoded);

    // The ID might be in different places depending on your token payload
    const storeId = decoded.id || decoded.storeId || decoded._id;

    if (!storeId) {
      return res.status(401).json({
        success: false,
        error: "Invalid token payload",
      });
    }

    const store = await Store.findById(storeId).select("-password");
    if (!store) {
      return res.status(401).json({
        success: false,
        error: "Store not found",
      });
    }

    // SET BOTH store and storeId
    req.store = store;
    req.storeId = store._id; // Use the actual store ID from database

    console.log("✅ Store auth successful:", store.name, "ID:", store._id);

    next();
  } catch (error) {
    console.error("Store auth middleware error:", error);
    res.status(401).json({
      success: false,
      error: "Authentication failed",
    });
  }
};
export default storeAuth;
