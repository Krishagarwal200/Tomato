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
      openingHours: {
        monday: {
          open: { type: String, default: "09:00" },
          close: { type: String, default: "22:00" },
        },
        tuesday: {
          open: { type: String, default: "09:00" },
          close: { type: String, default: "22:00" },
        },
        wednesday: {
          open: { type: String, default: "09:00" },
          close: { type: String, default: "22:00" },
        },
        thursday: {
          open: { type: String, default: "09:00" },
          close: { type: String, default: "22:00" },
        },
        friday: {
          open: { type: String, default: "09:00" },
          close: { type: String, default: "22:00" },
        },
        saturday: {
          open: { type: String, default: "09:00" },
          close: { type: String, default: "22:00" },
        },
        sunday: {
          open: { type: String, default: "09:00" },
          close: { type: String, default: "22:00" },
        },
      },
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
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance

storeSchema.index({ isActive: 1 });
storeSchema.index({ "storeInfo.category": 1 });

// Add method to get store orders
storeSchema.methods.getOrders = async function (
  status = null,
  page = 1,
  limit = 10
) {
  // Use mongoose.model to avoid circular imports
  const Order = mongoose.model("Order");
  let query = { store: this._id };

  if (status && status !== "all") {
    query.orderStatus = status;
  }

  const orders = await Order.find(query)
    .populate("user", "name email phone")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  return {
    orders,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total,
  };
};

// Add method to update order status
storeSchema.methods.updateOrderStatus = async function (
  orderId,
  newStatus,
  notes = null
) {
  const Order = mongoose.model("Order");
  const updateData = { orderStatus: newStatus };

  if (notes) {
    updateData.storeNotes = notes;
  }

  const order = await Order.findOneAndUpdate(
    { _id: orderId, store: this._id },
    updateData,
    { new: true }
  ).populate("user", "name email");

  return order;
};

// Add method to get store statistics - FIXED VERSION
storeSchema.methods.getStoreStats = async function () {
  const Order = mongoose.model("Order");

  const stats = await Order.aggregate([
    { $match: { store: this._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$amount" }, // Changed to $amount
        pendingOrders: {
          $sum: {
            $cond: [
              { $in: ["$orderStatus", ["pending", "confirmed", "preparing"]] },
              1,
              0,
            ],
          },
        },
        completedOrders: {
          $sum: {
            $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0],
          },
        },
        cancelledOrders: {
          $sum: {
            $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0],
          },
        },
        averageOrderValue: { $avg: "$amount" }, // Changed to $amount
      },
    },
  ]);

  // Get today's orders
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayOrders = await Order.countDocuments({
    store: this._id,
    createdAt: { $gte: startOfDay },
  });

  return stats[0]
    ? {
        ...stats[0],
        todayOrders,
      }
    : {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        averageOrderValue: 0,
        todayOrders: 0,
      };
};
// Add method to get recent orders
storeSchema.methods.getRecentOrders = async function (limit = 5) {
  const Order = mongoose.model("Order");

  return await Order.find({ store: this._id })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Add virtual for store display name
storeSchema.virtual("displayName").get(function () {
  return this.name;
});

// Check if model already exists to prevent OverwriteModelError
const Store = mongoose.models.Store || mongoose.model("Store", storeSchema);

export default Store;
