import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "Order must have at least one item",
      },
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    address: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      default: "Food Processing",
      enum: ["Food Processing", "Out for delivery", "Delivered", "Cancelled"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    payment: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const orderModel =
  mongoose.models.order || mongoose.model("Order", orderSchema);

export default orderModel;
