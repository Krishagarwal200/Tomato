import express from "express";
import multer from "multer";
import fs from "fs";
import {
  addFood,
  listFood,
  removeFood,
} from "../controllers/foodController.js";

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

foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.delete("/:id", removeFood);

export default foodRouter;
