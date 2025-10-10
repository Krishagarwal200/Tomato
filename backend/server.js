import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import orderRouter from "./routes/orderRoute.js";
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ override: true });
//app config
const app = express();
const port = process.env.PORT || 4000;

//middleware
app.use(express.json());
app.use(cors());
//db connection
connectDB();

import fs from "fs";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
//api endPoints
app.use(express.urlencoded({ extended: true }));
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/user", userRouter);
app.use("/api/order", orderRouter);
// Create uploads folder if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
  console.log("Uploads folder created");
}

app.use("/images", express.static("uploads/"));

//routes
app.get("/", (req, res) => res.status(200).send("hello"));

//listen
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
