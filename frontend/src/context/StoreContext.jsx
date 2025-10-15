import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

export const StoreContext = createContext(null);

const url = "http://localhost:4000";

const StoreContextProvider = (props) => {
  const [token, setToken] = useState("");
  const [cartItems, setCartItems] = useState({});
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingCart, setUpdatingCart] = useState({});

  const navigate = useNavigate();

  // Add item to cart
  const addToCart = async (item) => {
    if (!token) {
      toast.error('Please login to add items to cart');
      navigate('/');
      return;
    }

    const itemId = item._id || item.id;
    if (!itemId) {
      toast.error('Invalid item');
      return;
    }

    setUpdatingCart(prev => ({ ...prev, [itemId]: true }));

    try {
      const response = await axios.post(`${url}/api/cart/add`, {
        foodId: itemId,
        quantity: 1
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success(`${item.name} added to cart!`);
        // Update local cart state with new data from API
        setCartItems(response.data.cartData || {});
      } else {
        toast.error(response.data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
        localStorage.removeItem('token');
        setToken('');
        navigate('/');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add item to cart');
      }
    } finally {
      setUpdatingCart(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Decrease or remove item from cart
  const decreaseCartItem = async (itemId) => {
    if (!token) {
      toast.error('Please login to manage cart');
      navigate('/login');
      return;
    }

    if (!itemId) {
      toast.error('Invalid item');
      return;
    }

    setUpdatingCart(prev => ({ ...prev, [itemId]: true }));

    try {
      const response = await axios.put(`${url}/api/cart/decrease`, {
        foodId: itemId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        if (response.data.message.includes('removed')) {
          toast.success('Item removed from cart');
        } else {
          toast.success('Item quantity decreased');
        }
        // Update local cart state with new data from API
        setCartItems(response.data.cartData || {});
      } else {
        toast.error(response.data.message || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error decreasing cart item:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
        localStorage.removeItem('token');
        setToken('');
        navigate('/login');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update cart');
      }
    } finally {
      setUpdatingCart(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Remove item completely from cart
  const removeFromCart = async (itemId) => {
    if (!token) {
      toast.error('Please login to manage cart');
      navigate('/login');
      return;
    }

    if (!itemId) {
      toast.error('Invalid item');
      return;
    }

    setUpdatingCart(prev => ({ ...prev, [itemId]: true }));

    try {
      const response = await axios.delete(`${url}/api/cart/remove`, {
        data: { foodId: itemId },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success('Item removed from cart');
        setCartItems(response.data.cartData || {});
      } else {
        toast.error(response.data.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
        localStorage.removeItem('token');
        setToken('');
        navigate('/login');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to remove item from cart');
      }
    } finally {
      setUpdatingCart(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Fetch food list
  const fetchFoodItems = async () => {
    try {
      const response = await axios.get(`${url}/api/food`);
      if (response.data.success) {
        setFoodList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  };

  // Load cart items
  const loadCartItems = async (customToken = null) => {
    const currentToken = customToken || token;
    if (!currentToken) return;

    try {
      const response = await axios.get(`${url}/api/cart`, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (error) {
      console.error("Error loading cart items:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setToken('');
      }
    }
  };

  // Calculate total cart amount
  const getTotalCartAmount = () => {
    let total = 0;
    Object.keys(cartItems).forEach(itemId => {
      const item = cartItems[itemId];
      total += item.price * item.quantity;
    });
    return total;
  };

  // Calculate total items count
  const getTotalCartItems = () => {
    let total = 0;
    Object.keys(cartItems).forEach(itemId => {
      total += cartItems[itemId].quantity;
    });
    return total;
  };

  // Get item quantity from cart
  const getItemQuantity = (itemId) => {
    return cartItems[itemId]?.quantity || 0;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
    navigate('/');
    toast.success('Logged out successfully');
  };

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      await fetchFoodItems();

      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        await loadCartItems(savedToken);
      }
    };

    loadData();
  }, []);

  // Load cart when token changes
  useEffect(() => {
    if (token) {
      loadCartItems();
      fetchFoodItems();
    }
  }, [token]);

  const contextValue = {
    // State
    foodList,
    cartItems,
    token,
    loading,
    updatingCart,

    // Functions
    addToCart,
    decreaseCartItem,
    removeFromCart,
    setToken,
    loadCartItems,

    getTotalCartAmount,
    getTotalCartItems,
    getItemQuantity,
    logout,
    fetchFoodItems,
    // Constants
    url
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;