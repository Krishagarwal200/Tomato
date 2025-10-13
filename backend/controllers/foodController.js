import mongoose from "mongoose";
import Food from "../models/foodModel.js";
import Store from "../models/storeModel.js";

export const addFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Get storeId from middleware (store authentication)
    const storeId = req.storeId || req.store?._id;

    if (!storeId) {
      return res.status(401).json({
        success: false,
        error: "Store authentication required. Please login as store.",
      });
    }

    // Verify store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        error: "Store not found",
      });
    }

    // Create new food item with store reference
    const food = new Food({
      name: req.body.name,
      price: Number(req.body.price),
      description: req.body.description,
      image: req.file.filename,
      category: req.body.category,
      store: storeId, // Link to store
    });

    const savedFood = await food.save();

    // Add food reference to store's products array
    store.products.push(savedFood._id);
    await store.save();

    res.status(201).json({
      success: true,
      message: "Food item added successfully",
      food: {
        id: savedFood._id,
        name: savedFood.name,
        price: savedFood.price,
        description: savedFood.description,
        category: savedFood.category,
        image: savedFood.image,
        store: storeId,
      },
    });
  } catch (err) {
    console.error("Error adding food:", err);

    // More specific error response
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Get foods by store ID
// Get foods by store ID
// Get foods by store ID
export const getFoodsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;

    console.log("🔵 getFoodsByStore - Received storeId:", storeId);
    console.log("🔵 Request params:", req.params);

    // Validate storeId
    if (!storeId || storeId === "undefined" || storeId === "null") {
      console.log("❌ Store ID validation failed");
      return res.status(400).json({
        success: false,
        error: "Store ID is required",
      });
    }

    // Check if storeId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      console.log("❌ Invalid ObjectId format:", storeId);
      return res.status(400).json({
        success: false,
        error: "Invalid store ID format",
      });
    }

    console.log("✅ Store ID is valid, checking store existence...");

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      console.log("❌ Store not found for ID:", storeId);
      return res.status(404).json({
        success: false,
        error: "Store not found",
      });
    }

    console.log("✅ Store found:", store.name);
    console.log("🔍 Querying foods for store:", storeId);

    // Get foods for this store
    const foods = await Food.find({ store: storeId }).sort({ createdAt: -1 });

    console.log(`✅ Found ${foods.length} foods for store ${storeId}`);

    res.status(200).json({
      success: true,
      foods,
      count: foods.length,
      storeName: store.name,
    });
  } catch (error) {
    console.error("❌ Error in getFoodsByStore:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid store ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch store foods",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
