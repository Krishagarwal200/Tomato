import { fstat } from "fs";
import foodModel from "../models/foodModel.js";
import fs from "fs";
const addFood = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Convert price to number to match your schema
    const food = new foodModel({
      name: req.body.name,
      price: Number(req.body.price), // Ensure it's a number
      description: req.body.description,
      image: req.file.filename, // Simplified
      category: req.body.category,
    });

    const savedFood = await food.save();

    res.status(201).json({
      success: true,
    });
  } catch (err) {
    console.error("Error adding food:", err);

    // More specific error response
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.status(200).json({ success: true, foods });
  } catch (err) {
    console.error("Error listing food:", err);
    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.params.id); // Use params instead of body for DELETE

    if (!food) {
      return res
        .status(404)
        .json({ success: false, error: "Food item not found" });
    }

    // Delete image file
    fs.unlink(`uploads/${food.image}`, (err) => {
      if (err) {
        console.error("Error deleting image:", err);
        // Don't return error here - we still want to delete the database record
      }
    });

    await foodModel.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Food item removed successfully" }); // Fixed typo: succes → success
  } catch (err) {
    console.error("Error removing food:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export { addFood, listFood, removeFood };
