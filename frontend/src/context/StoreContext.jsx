import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const url = "http://localhost:4000";

const StoreContextProvider = (props) => {
  const [token, setToken] = useState("");
  const [cartItems, setCartItems] = useState({});
  const [foodList, setFoodList] = useState([]);

  // Add item to cart
  const addToCart = async (itemId) => {
    // Update local state immediately for better UX
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }

    // Sync with backend if user is logged in
    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/add`,
          { foodId: itemId },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.error("Error adding to cart:", error.response?.data);
        // Revert local state if backend call fails
        setCartItems((prev) => ({
          ...prev,
          [itemId]: prev[itemId] > 1 ? prev[itemId] - 1 : 0
        }));
      }
    }
  };

  // Fetch food list
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      setFoodList(response.data.foods);
    } catch (error) {
      console.error("Error fetching food list:", error);
    }
  };

  // Load cart items from backend - FIXED: Accept token parameter
  const loadCartItems = async (userToken = token) => {
    const currentToken = userToken || token;

    if (!currentToken) {
      console.log("No token available for loading cart");
      return;
    }

    try {
      const response = await axios.get(`${url}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      console.log("Cart response:", response.data);

      // Make sure we're setting the cart data correctly
      if (response.data.success && response.data.cartData) {
        setCartItems(response.data.cartData);
      } else if (response.data.cartItems) {
        // Fallback for different response structure
        setCartItems(response.data.cartItems);
      } else {
        console.log("Unexpected cart response structure:", response.data);
      }
    } catch (error) {
      console.error("Error loading cart items:", error.response?.data || error.message);
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    // Update local state immediately
    if (cartItems[itemId] > 1) {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    } else {
      setCartItems((prev) => {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      });
    }

    // Sync with backend
    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/remove`,
          { foodId: itemId },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.error("Error removing from cart:", error.response?.data);
      }
    }
  };

  const getTotalCartAmount = () => {
    let total = 0;
    foodList.forEach(item => {
      if (cartItems[item._id] > 0) {
        total += item.price * cartItems[item._id];
      }
    });
    return total;
  };

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      await fetchFoodList();

      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        // Load cart immediately with the saved token
        await loadCartItems(savedToken);
      }
    };

    loadData();
  }, []);

  // Load cart when token changes - FIXED: Added dependency
  useEffect(() => {
    if (token) {
      loadCartItems();
    }
  }, [token]);

  const contextValue = {
    food_list: foodList,
    cartItems,
    addToCart,
    removeFromCart,
    setCartItems,
    getTotalCartAmount,
    url,
    token,
    settoken: setToken,
    loadCartItems
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;