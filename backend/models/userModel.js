import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: {
      type: Map,
      of: {
        quantity: { type: Number, default: 1 },
        name: String,
        price: Number,
        image: String,
        addedAt: { type: Date, default: Date.now },
      },
      default: {},
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const userModel = mongoose.models.user || mongoose.model("User", userSchema);
export default userModel;
