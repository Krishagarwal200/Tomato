import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    storeInfo: {
      description: { type: String, default: "" },
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
      category: { type: String, default: "General" },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
      },
    ],
    orders: { type: Object, default: {} },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Store", storeSchema);
