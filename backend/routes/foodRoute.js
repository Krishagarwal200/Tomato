import express from "express";
import multer from "multer";
import fs from "fs";
import {
  addFood,
  deleteFood,
  getFoodsByStore,
  listFood,
} from "../controllers/foodController.js";
import authMiddleware from "../middleware/auth.js";
import storeAuth from "../middleware/storeAuth.js";
// Import auth middleware

const foodRouter = express.Router();

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
foodRouter.get("/", listFood);
// Add store authentication middleware to protect the route
foodRouter.post("/store/add", authMiddleware, upload.single("image"), addFood);
foodRouter.get("/store/:storeId", getFoodsByStore);
foodRouter.delete("/:id", storeAuth, deleteFood);

export default foodRouter;
