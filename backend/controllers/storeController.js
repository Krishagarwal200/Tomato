import Store from "../models/storeModel.js";
import Food from "../models/foodModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Generate JWT Token
const generateToken = (storeId) => {
  console.log("🎫 Generating token for store ID:", storeId);
  console.log("🔑 JWT_SECRET exists:", !!process.env.JWT_SECRET);

  return jwt.sign(
    {
      id: storeId,
      type: "store",
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// Store Registration
export const storeRegister = async (req, res) => {
  try {
    const { name, email, password, storeInfo } = req.body;

    if (!name || !email || !password) {
      const missing = [];
      if (!name) missing.push("name");
      if (!email) missing.push("email");
      if (!password) missing.push("password");
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    const existingStore = await Store.findOne({ email });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: "Store with this email already exists",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStore = new Store({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      storeInfo: storeInfo || {},
    });

    const savedStore = await newStore.save();

    res.status(201).json({
      success: true,
      message: "Store registered successfully",
      store: {
        id: savedStore._id,
        name: savedStore.name,
        email: savedStore.email,
        storeInfo: savedStore.storeInfo,
        isActive: savedStore.isActive,
      },
    });
  } catch (error) {
    console.error("Store registration error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Get All Stores (Public)
export const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find({ isActive: true })
      .select("-password") // Exclude password
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      stores,
      count: stores.length,
    });
  } catch (error) {
    console.error("Get all stores error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stores",
    });
  }
};
// Get Store by ID
export const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId).select("-password");

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    res.status(200).json({
      success: true,
      store,
    });
  } catch (error) {
    console.error("Get store by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store details",
    });
  }
};

// Get Store Items (you'll need to implement this based on your food model)
export const getStoreItems = async (req, res) => {
  try {
    // This depends on how you've structured your food items
    // Example: assuming you have a Food model with store reference
    const items = await Food.find({
      store: req.params.storeId,
      isAvailable: true,
    });

    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Get store items error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store items",
    });
  }
};

// Store Login
export const storeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔵 Store Login Request:", { email });

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find store by email
    const store = await Store.findOne({ email: email.toLowerCase() });
    if (!store) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if store is active
    if (!store.isActive) {
      return res.status(401).json({
        success: false,
        message: "Store account is deactivated. Please contact support.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, store.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("✅ Store login successful for:", store.name);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: store._id,
        type: "store",
        email: store.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Return response without password
    res.status(200).json({
      success: true,
      message: "Store login successful",
      store: {
        id: store._id,
        name: store.name,
        email: store.email,
        storeInfo: store.storeInfo,
        isActive: store.isActive,
        products: store.products,
        orders: store.orders,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Store login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
