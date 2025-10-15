import Order from "../models/orderModel.js";
import Store from "../models/storeModel.js";

// Get all orders for a store
export const getStoreOrders = async (req, res) => {
  try {
    // Use the store object directly from middleware
    const store = req.store;

    if (!store) {
      return res.status(401).json({
        success: false,
        message: "Store authentication required. Please login as store.",
      });
    }

    const storeId = store._id;
    const { status, page = 1, limit = 10 } = req.query;

    console.log(`🔵 Fetching orders for store: ${store.name} (${storeId})`);

    let query = { store: storeId };
    if (status && status !== "all") {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      store: {
        id: store._id,
        name: store.name,
      },
    });
  } catch (error) {
    console.error("Get store orders error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const storeId = req.storeId;
    const { orderId } = req.params;
    const { status, notes, estimatedDeliveryTime } = req.body;

    console.log(
      "🔵 updateOrderStatus - Store ID:",
      storeId,
      "Order ID:",
      orderId,
      "Status:",
      status
    );

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // Find the order and verify it belongs to this store
    const order = await Order.findOne({ _id: orderId, store: storeId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found or you don't have permission to update this order",
      });
    }

    // Update the order
    const updateData = { orderStatus: status };
    if (notes) updateData.storeNotes = notes;
    if (estimatedDeliveryTime)
      updateData.estimatedDeliveryTime = estimatedDeliveryTime;

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, store: storeId },
      updateData,
      { new: true, runValidators: true }
    ).populate("user", "name email phone");

    console.log("✅ Order status updated successfully");

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Update order status error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get store statistics// In getStoreStats function, remove the duplicate todayOrders calculation:
export const getStoreStats = async (req, res) => {
  try {
    const storeId = req.storeId;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const stats = await store.getStoreStats();

    res.status(200).json({
      success: true,
      stats, // stats already includes todayOrders
    });
  } catch (error) {
    console.error("Get store stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
