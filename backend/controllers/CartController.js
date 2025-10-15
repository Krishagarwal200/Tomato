import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import mongoose from "mongoose";
// Helper function to calculate total amount
// const calculateTotalAmount = (cartItems) => {
//   return cartItems.reduce((total, item) => {
//     return total + item.price * item.quantity;
//   }, 0);
// };

// // Helper function to get cart with food details
// const getCartWithDetails = async (cartData) => {
//   try {
//     console.log("🔵 [getCartWithDetails] Input:", cartData);

//     // Handle Map
//     if (cartData instanceof Map) {
//       console.log("🔵 Processing as Map");
//       const cartItems = [];

//       for (const [foodId, itemData] of cartData.entries()) {
//         console.log(
//           "🔵 Processing Map entry - foodId:",
//           foodId,
//           "itemData:",
//           itemData
//         );

//         // Only process valid food IDs
//         if (typeof foodId === "string" && foodId.match(/^[0-9a-fA-F]{24}$/)) {
//           const foodItem = await foodModel.findById(foodId);
//           console.log("🔵 Found food item:", foodItem);

//           if (foodItem) {
//             cartItems.push({
//               _id: foodId,
//               quantity: itemData.quantity || 1,
//               name: itemData.name || foodItem.name,
//               price: itemData.price || foodItem.price,
//               description: itemData.description || foodItem.description,
//               image: itemData.image || foodItem.image,
//               category: foodItem.category,
//             });
//           }
//         }
//       }
//       console.log("🔵 Final cart items from Map:", cartItems);
//       return cartItems;
//     }

//     // Handle Object
//     else if (typeof cartData === "object" && cartData !== null) {
//       console.log("🔵 Processing as Object");
//       const cartItems = [];

//       for (const [foodId, itemData] of Object.entries(cartData)) {
//         console.log(
//           "🔵 Processing Object entry - foodId:",
//           foodId,
//           "itemData:",
//           itemData
//         );

//         if (foodId.match(/^[0-9a-fA-F]{24}$/)) {
//           const foodItem = await foodModel.findById(foodId);
//           console.log("🔵 Found food item:", foodItem);

//           if (foodItem) {
//             cartItems.push({
//               _id: foodId,
//               quantity: itemData.quantity || 1,
//               name: itemData.name || foodItem.name,
//               price: itemData.price || foodItem.price,
//               description: itemData.description || foodItem.description,
//               image: itemData.image || foodItem.image,
//               category: foodItem.category,
//             });
//           }
//         }
//       }
//       console.log("🔵 Final cart items from Object:", cartItems);
//       return cartItems;
//     }

//     console.log("🔵 No valid cart data found");
//     return [];
//   } catch (error) {
//     console.error("❌ [getCartWithDetails ERROR]:", error);
//     return [];
//   }
// };
const getCartWithDetails = async (cartData) => {
  const cartItems = [];
  let totalAmount = 0;
  let totalItems = 0;

  if (cartData instanceof Map) {
    for (let [foodId, cartItem] of cartData.entries()) {
      const foodDetails = await foodModel.findById(foodId);
      if (foodDetails) {
        const itemTotal = cartItem.quantity * foodDetails.price;
        cartItems.push({
          foodId: foodId,
          ...cartItem,
          details: foodDetails,
          itemTotal: itemTotal,
        });
        totalAmount += itemTotal;
        totalItems += cartItem.quantity;
      }
    }
  }

  return {
    items: cartItems,
    totalAmount: totalAmount,
    totalItems: totalItems,
  };
};
export const addToCart = async (req, res) => {
  try {
    const { foodId, quantity = 1 } = req.body;
    const userId = req.userId;

    console.log(
      "Add to cart - User:",
      userId,
      "Food:",
      foodId,
      "Quantity:",
      quantity
    );

    // Validate input
    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "Food ID is required",
      });
    }

    // Find user and validate
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find the food item to get its details and store ID
    const foodItem = await foodModel.findById(foodId).populate("store");
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const newStoreId = foodItem.store?._id?.toString();
    if (!newStoreId) {
      return res.status(400).json({
        success: false,
        message: "Food item does not belong to any store",
      });
    }

    // Initialize cartData if it doesn't exist
    if (!user.cartData) {
      user.cartData = new Map();
    }

    // Check if cart has items from different store
    let currentStoreId = null;
    let itemsToRemove = [];

    if (user.cartData.size > 0) {
      // Get all food IDs in cart to check their store
      const cartFoodIds = Array.from(user.cartData.keys());

      // Find store IDs for all items in cart
      const foodItemsInCart = await foodModel
        .find({
          _id: { $in: cartFoodIds },
        })
        .select("store");

      // Create a map of foodId to storeId
      const foodStoreMap = {};
      foodItemsInCart.forEach((item) => {
        foodStoreMap[item._id.toString()] = item.store?.toString();
      });

      // Check if any item belongs to a different store
      user.cartData.forEach((value, key) => {
        const itemStoreId = foodStoreMap[key];
        if (itemStoreId && itemStoreId !== newStoreId) {
          itemsToRemove.push(key);
        } else if (itemStoreId) {
          currentStoreId = itemStoreId; // Set current store ID
        }
      });
    }

    // If adding item from different store, clear all existing items
    if (itemsToRemove.length > 0) {
      itemsToRemove.forEach((foodIdToRemove) => {
        user.cartData.delete(foodIdToRemove);
      });

      console.log(`Cleared ${itemsToRemove.length} items from different store`);
    }

    // Check if item already exists in cart (after potential clearing)
    const existingItem = user.cartData.get(foodId);

    if (existingItem) {
      // Update quantity if item exists
      existingItem.quantity += parseInt(quantity);
      user.cartData.set(foodId, existingItem);
    } else {
      // Add new item to cart
      user.cartData.set(foodId, {
        quantity: parseInt(quantity),
        name: foodItem.name,
        price: foodItem.price,
        image: foodItem.image,
        storeId: newStoreId,
        storeName: foodItem.store?.name || "Unknown Store",
        addedAt: new Date(),
      });
    }

    // Save the user
    await user.save();

    // Convert Map to Object for response
    const cartDataObject = {};
    user.cartData.forEach((value, key) => {
      cartDataObject[key] = value;
    });

    // Calculate total items and amount
    let totalItems = 0;
    let totalAmount = 0;

    user.cartData.forEach((item) => {
      totalItems += item.quantity;
      totalAmount += item.quantity * item.price;
    });

    // Prepare response message
    let message = "Item added to cart successfully";
    if (itemsToRemove.length > 0) {
      message = `Cart cleared and item added. You can only order from one store at a time.`;
    }

    res.status(200).json({
      success: true,
      message: message,
      cartData: cartDataObject,
      totalItems: totalItems,
      totalAmount: totalAmount,
      storeId: newStoreId,
      storeName: foodItem.store?.name || "Unknown Store",
      item: {
        id: foodId,
        name: foodItem.name,
        quantity: existingItem ? existingItem.quantity : quantity,
        price: foodItem.price,
      },
      clearedItems: itemsToRemove.length > 0 ? itemsToRemove : undefined,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
export const decreaseCartItem = async (req, res) => {
  try {
    const { foodId } = req.body;
    const userId = req.userId;

    console.log("Decrease cart item - User:", userId, "Food:", foodId);

    // Validate input
    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "Food ID is required",
      });
    }

    // Find user and validate
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if cartData exists and has the item
    if (!user.cartData || !user.cartData.get(foodId)) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    const cartItem = user.cartData.get(foodId);

    // Decrease quantity
    if (cartItem.quantity > 1) {
      // Decrease quantity by 1
      cartItem.quantity -= 1;
      user.cartData.set(foodId, cartItem);

      await user.save();

      // Convert Map to Object for response
      const cartDataObject = {};
      user.cartData.forEach((value, key) => {
        cartDataObject[key] = value;
      });

      // Calculate totals
      let totalItems = 0;
      let totalAmount = 0;

      user.cartData.forEach((item) => {
        totalItems += item.quantity;
        totalAmount += item.quantity * item.price;
      });

      return res.status(200).json({
        success: true,
        message: "Item quantity decreased",
        cartData: cartDataObject,
        totalItems: totalItems,
        totalAmount: totalAmount,
        item: {
          id: foodId,
          name: cartItem.name,
          quantity: cartItem.quantity,
          price: cartItem.price,
        },
      });
    } else {
      // Remove item completely if quantity becomes 0
      user.cartData.delete(foodId);
      await user.save();

      // Convert Map to Object for response
      const cartDataObject = {};
      user.cartData.forEach((value, key) => {
        cartDataObject[key] = value;
      });

      // Calculate totals
      let totalItems = 0;
      let totalAmount = 0;

      user.cartData.forEach((item) => {
        totalItems += item.quantity;
        totalAmount += item.quantity * item.price;
      });

      return res.status(200).json({
        success: true,
        message: "Item removed from cart",
        cartData: cartDataObject,
        totalItems: totalItems,
        totalAmount: totalAmount,
        removedItem: foodId,
      });
    }
  } catch (error) {
    console.error("Decrease cart item error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    res.status(500).json({
      /*************  ✨ Windsurf Command ⭐  *************/
      /**
 * Decrease the quantity of a food item in the user's cart by 1.
 * If the quantity becomes 0, the item is removed from the cart.
 * @param {Object} req.body - Request body containing the food ID to decrease.
 * @param {Object} req.userId - The ID of the user making the request.
 * @returns {Object} Response containing the updated cart data and totals.
 * @throws {Error} 400 - If the food ID is invalid.
 * @throws {Error} 404 - If the item is not found in the cart.
 * @throws {Error} 500 - If an internal server error occurs.
/*******  1fba4b98-1011-4fd3-8504-6601c2553299  *******/ success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
export const getCartItems = async (req, res) => {
  try {
    const userId = req.userId;

    // Find user and validate
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Initialize cartData if it doesn't exist
    if (!user.cartData) {
      user.cartData = new Map();
      await user.save();
    }

    // Convert Map to Object for response
    const cartDataObject = {};
    if (user.cartData instanceof Map) {
      user.cartData.forEach((value, key) => {
        cartDataObject[key] = value;
      });
    } else {
      Object.assign(cartDataObject, user.cartData);
    }

    // Calculate totals
    let totalItems = 0;
    let totalAmount = 0;

    if (user.cartData instanceof Map) {
      user.cartData.forEach((item) => {
        totalItems += item.quantity;
        totalAmount += item.quantity * item.price;
      });
    } else {
      Object.values(user.cartData).forEach((item) => {
        totalItems += item.quantity;
        totalAmount += item.quantity * item.price;
      });
    }

    res.status(200).json({
      success: true,
      cartData: cartDataObject,
      totalItems: totalItems,
      totalAmount: totalAmount,
    });
  } catch (error) {
    console.error("Get cart items error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
export const removeFromCart = async (req, res) => {
  try {
    const { foodId } = req.body;
    const userId = req.userId;

    // Validate input
    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "Food ID is required",
      });
    }

    // Find user and validate
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if cartData exists and has the item
    if (!user.cartData || !user.cartData.get(foodId)) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Remove item from cart
    user.cartData.delete(foodId);
    await user.save();

    // Convert Map to Object for response
    const cartDataObject = {};
    user.cartData.forEach((value, key) => {
      cartDataObject[key] = value;
    });

    // Calculate totals
    let totalItems = 0;
    let totalAmount = 0;

    user.cartData.forEach((item) => {
      totalItems += item.quantity;
      totalAmount += item.quantity * item.price;
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cartData: cartDataObject,
      totalItems: totalItems,
      totalAmount: totalAmount,
      removedItem: foodId,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Add your removeFromCart, clearCart functions here...
