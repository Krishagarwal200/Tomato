import mongoose from "mongoose";
import Food from "../models/foodModel.js";
import Store from "../models/storeModel.js";

// Get all available food items
export const listFood = async (req, res) => {
  try {
    const foods = await Food.find({ isAvailable: true })
      .populate("store", "name") // Populate store name
      .select("name price image store category");

    res.json({
      success: true,
      data: foods,
    });
  } catch (error) {
    console.error("List food error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching food items",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
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
export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    // DEBUG: Check what's actually in the request
    console.log("🔵 deleteFood - Debug Info:");
    console.log("🔵 Food ID:", id);
    console.log("🔵 req.storeId:", req.storeId);
    console.log("🔵 req.store:", req.store);
    console.log("🔵 Headers:", req.headers);
    console.log("🔵 Full req object keys:", Object.keys(req));

    // Validate food ID
    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({
        success: false,
        error: "Food ID is required",
      });
    }

    // Check if food ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid food ID format",
      });
    }

    // Check if storeId exists
    if (!req.storeId) {
      return res.status(401).json({
        success: false,
        error: "Store authentication required. Please login again.",
      });
    }

    // Find the food item
    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({
        success: false,
        error: "Food item not found",
      });
    }

    // DEBUG: Check food store vs request store
    console.log("🔵 Food store ID:", food.store?.toString());
    console.log("🔵 Request store ID:", req.storeId.toString());
    console.log(
      "🔵 Store IDs match:",
      food.store?.toString() === req.storeId.toString()
    );

    // Check if the store owns this food item
    if (food.store.toString() !== req.storeId.toString()) {
      return res.status(403).json({
        success: false,
        error:
          "You are not authorized to delete this food item. This food belongs to a different store.",
      });
    }

    // Delete the food item
    await Food.findByIdAndDelete(id);

    // Remove food reference from store's products array
    await Store.findByIdAndUpdate(
      req.storeId,
      { $pull: { products: id } },
      { new: true }
    );

    console.log("✅ Food item deleted successfully:", id);

    res.status(200).json({
      success: true,
      message: "Food item deleted successfully",
      deletedFoodId: id,
    });
  } catch (error) {
    console.error("❌ Error deleting food:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid food ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to delete food item",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
