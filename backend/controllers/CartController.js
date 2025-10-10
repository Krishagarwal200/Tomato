import userModel from "../models/userModel.js";

// Add to cart
export const addToCart = async (req, res) => {
  try {
    const { foodId, quantity = 1 } = req.body;

    // Validation
    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "Food ID is required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const userId = req.userId;

    // Find user and update cart
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert cartData to Map if it's not already
    if (!user.cartData || !(user.cartData instanceof Map)) {
      user.cartData = new Map(Object.entries(user.cartData || {}));
    }

    // Add or update item quantity
    const currentQuantity = user.cartData.get(foodId) || 0;
    user.cartData.set(foodId, currentQuantity + quantity);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cartData: Object.fromEntries(user.cartData),
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Remove from cart (decrease quantity by one)
export const removeFromCart = async (req, res) => {
  try {
    const { foodId } = req.body;

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "Food ID is required",
      });
    }

    const userId = req.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert cartData to Map if needed
    if (!user.cartData || !(user.cartData instanceof Map)) {
      user.cartData = new Map(Object.entries(user.cartData || {}));
    }

    if (!user.cartData.has(foodId)) {
      return res.status(400).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    const currentQuantity = user.cartData.get(foodId);

    if (currentQuantity > 1) {
      user.cartData.set(foodId, currentQuantity - 1);
    } else {
      user.cartData.delete(foodId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Item updated in cart",
      cartData: Object.fromEntries(user.cartData),
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user cart
export const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert cartData to plain object
    let cartData = {};
    if (user.cartData instanceof Map) {
      cartData = Object.fromEntries(user.cartData);
    } else {
      cartData = user.cartData || {};
    }

    res.status(200).json({
      success: true,
      cartData,
      itemCount: Object.keys(cartData).length,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update cart item quantity
// export const updateCartItem = async (req, res) => {
//   try {
//     const { foodId, quantity } = req.body;

//     if (!foodId || quantity === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "Food ID and quantity are required",
//       });
//     }

//     if (quantity < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Quantity cannot be negative",
//       });
//     }

//     const userId = req.userId;
//     const user = await userModel.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Convert cartData to Map if needed
//     if (!user.cartData || !(user.cartData instanceof Map)) {
//       user.cartData = new Map(Object.entries(user.cartData || {}));
//     }

//     if (quantity === 0) {
//       user.cartData.delete(foodId);
//     } else {
//       user.cartData.set(foodId, quantity);
//     }

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Cart updated successfully",
//       cartData: Object.fromEntries(user.cartData),
//     });
//   } catch (error) {
//     console.error("Update cart error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// Clear entire cart
// export const clearCart = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const user = await userModel.findById(userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     user.cartData = new Map();
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Cart cleared successfully",
//       cartData: {},
//     });
//   } catch (error) {
//     console.error("Clear cart error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
