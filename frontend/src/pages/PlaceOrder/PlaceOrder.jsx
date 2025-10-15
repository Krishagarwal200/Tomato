import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios';
import { useEffect } from 'react';

const PlaceOrder = () => {
  const { cartItems, foodList, getTotalCartAmount, token, url } = useContext(StoreContext);
  const navigate = useNavigate();
  useEffect(() => {
    const testFetch = async () => {
      try {
        const response = await axios.get(`${url}/api/food`);
        console.log('Food API Response:', response.data);
        if (response.data.success) {
          console.log('First food item with store:', response.data.data[0]);
        }
      } catch (error) {
        console.error('Test fetch failed:', error);
      }
    };
    testFetch();
  }, [url]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    phone: '',
    paymentMethod: 'card'
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Validate form data
    if (!formData.name || !formData.address || !formData.city || !formData.pincode || !formData.state || !formData.phone) {
      alert('Please fill all the required fields');
      setLoading(false);
      return;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      alert('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    // Prepare order items with store ID
    const orderItems = [];
    Object.keys(cartItems).forEach(itemId => {
      const cartItem = cartItems[itemId];
      if (cartItem && cartItem.quantity > 0) {
        const foodItem = foodList.find(item => item._id === itemId);
        orderItems.push({
          foodId: itemId,
          name: foodItem ? foodItem.name : cartItem.name,
          price: foodItem ? foodItem.price : cartItem.price,
          quantity: cartItem.quantity,
          image: foodItem ? foodItem.image : cartItem.image,
          storeId: foodItem?.store || cartItem.storeId
        });
      }
    });

    if (orderItems.length === 0) {
      alert('Your cart is empty');
      setLoading(false);
      return;
    }

    // Check if all items are from the same store
    // const storeIds = [...new Set(orderItems.map(item => item.storeId))];
    // if (storeIds.length > 1) {
    //   alert('Please order from one store at a time. Your cart contains items from multiple stores.');
    //   setLoading(false);
    //   return;
    // }

    // Calculate totals
    const totalCartAmount = getTotalCartAmount ? getTotalCartAmount() : 0;
    const deliveryFee = totalCartAmount > 0 ? 5 : 0;
    const tax = totalCartAmount * 0.1;
    const finalTotal = totalCartAmount + deliveryFee + tax;

    // Prepare order data
    const orderData = {
      items: orderItems,
      amount: finalTotal,
      address: {
        name: formData.name,
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.pincode,
        phone: formData.phone
      },
      paymentMethod: formData.paymentMethod
    };



    try {
      if (!token) {
        alert('Please login to place an order');
        setLoading(false);
        return;
      }
      console.log(cartItems);
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('Backend response:', response.data);

      if (response.data.success) {
        if (formData.paymentMethod === 'cash') {
          // For cash on delivery
          alert('Order placed successfully! You will pay cash on delivery.');
          // Redirect to success page
          navigate('/order-success', {
            state: {
              order: response.data.order,
              message: 'Order placed successfully! You will pay cash on delivery.'
            }
          });
        } else {
          // For online payments, redirect to Stripe
          const { session_url } = response.data;
          if (session_url && session_url.startsWith('http')) {
            window.location.replace(session_url);
          } else {
            console.error('Invalid session URL:', session_url);
            alert('Payment initialization failed. Please try again.');
          }
        }
      } else {
        alert('Failed to place order: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Order placement error:', error);

      // Detailed error handling
      if (error.code === 'ECONNABORTED') {
        alert('Request timeout. The server is taking too long to respond. Please try again.');
      } else if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);

        if (error.response.status === 401) {
          alert('Session expired. Please login again.');
          navigate('/login');
        } else if (error.response.status === 400) {
          alert('Invalid order data: ' + (error.response.data?.message || 'Please check your information'));
        } else if (error.response.status === 404) {
          alert('Store not found or inactive. Please try ordering from a different store.');
        } else if (error.response.status === 500) {
          alert('Server error. Please try again later.');
        } else {
          alert('Error: ' + (error.response.data?.message || 'Failed to place order'));
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalCartAmount = getTotalCartAmount ? getTotalCartAmount() : 0;
  const deliveryFee = totalCartAmount > 0 ? 5 : 0;
  const tax = totalCartAmount * 0.1;
  const finalTotal = totalCartAmount + deliveryFee + tax;

  // Get cart items for display
  const cartItemsArray = Object.keys(cartItems)
    .map(itemId => {
      const cartItem = cartItems[itemId];
      const foodItem = foodList.find(item => item._id === itemId);
      return {
        ...cartItem,
        itemId,
        foodItem
      };
    })
    .filter(item => item.quantity > 0);

  // Debug to see what's available
  console.log('Food item structure:', cartItemsArray[0]?.foodItem);

  // Updated storeName logic
  const storeName = cartItemsArray.length > 0
    ? cartItemsArray[0].foodItem?.store?.name ||  // If store is populated as object
    cartItemsArray[0].storeName ||              // If storeName is in cart item
    'Store'
    : 'Store';

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      <h1 className='text-4xl font-bold text-gray-800 mb-2 text-center'>Place Your Order</h1>
      <p className='text-gray-600 text-center mb-8'>Complete your order with delivery details</p>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Delivery Information */}
        <div className='bg-white rounded-2xl shadow-lg p-6'>
          <h2 className='text-2xl font-bold text-gray-800 mb-6'>Delivery Information</h2>

          <form onSubmit={placeOrder} className='space-y-6'>
            {/* Full Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Full Name *
              </label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                placeholder='Enter your full name'
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200'
              />
            </div>

            {/* Address */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Delivery Address *
              </label>
              <input
                type='text'
                name='address'
                value={formData.address}
                onChange={handleChange}
                placeholder='Enter your complete address'
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200'
              />
            </div>

            {/* City, Pincode, State */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  City *
                </label>
                <input
                  type='text'
                  name='city'
                  value={formData.city}
                  onChange={handleChange}
                  placeholder='Enter city'
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Pincode *
                </label>
                <input
                  type='text'
                  name='pincode'
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder='Pincode'
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  State *
                </label>
                <input
                  type='text'
                  name='state'
                  value={formData.state}
                  onChange={handleChange}
                  placeholder='Enter state'
                  required
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200'
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Phone Number *
              </label>
              <input
                type='tel'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                placeholder='Enter your phone number'
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200'
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-4'>
                Payment Method *
              </label>
              <div className='space-y-3'>
                <label className='flex items-center space-x-3 cursor-pointer'>
                  <input
                    type='radio'
                    name='paymentMethod'
                    value='card'
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                    className='w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500'
                  />
                  <span className='text-gray-700'>Credit/Debit Card</span>
                </label>
                <label className='flex items-center space-x-3 cursor-pointer'>
                  <input
                    type='radio'
                    name='paymentMethod'
                    value='cash'
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                    className='w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500'
                  />
                  <span className='text-gray-700'>Cash on Delivery</span>
                </label>
                <label className='flex items-center space-x-3 cursor-pointer'>
                  <input
                    type='radio'
                    name='paymentMethod'
                    value='upi'
                    checked={formData.paymentMethod === 'upi'}
                    onChange={handleChange}
                    className='w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500'
                  />
                  <span className='text-gray-700'>UPI Payment</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={cartItemsArray.length === 0 || loading}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${cartItemsArray.length === 0 || loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : cartItemsArray.length === 0 ? (
                'Cart is Empty'
              ) : (
                `Place Order with ${storeName}`
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className='bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-8'>
          <h2 className='text-2xl font-bold text-gray-800 mb-6'>Order Summary</h2>

          {/* Store Info */}
          {storeName && (
            <div className='mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200'>
              <p className='text-blue-700 font-medium'>Ordering from: {storeName}</p>
            </div>
          )}

          {/* Order Items */}
          <div className='space-y-4 mb-6 max-h-64 overflow-y-auto'>
            {cartItemsArray.length === 0 ? (
              <p className='text-gray-500 text-center py-4'>No items in cart</p>
            ) : (
              cartItemsArray.map((item) => (
                <div key={item.itemId} className='flex justify-between items-center pb-4 border-b border-gray-200'>
                  <div className='flex items-center space-x-3'>
                    <img
                      src={`${url}/images/${item.foodItem?.image || item.image}`}
                      alt={item.foodItem?.name || item.name}
                      className='w-12 h-12 rounded-lg object-cover'
                    />
                    <div>
                      <h3 className='font-semibold text-gray-800'>{item.foodItem?.name || item.name}</h3>
                      <p className='text-sm text-gray-500'>Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <span className='font-semibold text-gray-800'>
                    ${((item.foodItem?.price || item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Price Breakdown */}
          <div className='space-y-3 mb-6'>
            <div className='flex justify-between text-gray-600'>
              <span>Subtotal</span>
              <span>${totalCartAmount.toFixed(2)}</span>
            </div>
            <div className='flex justify-between text-gray-600'>
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className='flex justify-between text-gray-600'>
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <hr className='border-gray-200' />
            <div className='flex justify-between text-lg font-bold text-gray-800'>
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Back to Cart Button */}
          <Link
            to='/cart'
            className='block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors duration-200 text-center mb-3'
          >
            Back to Cart
          </Link>

          {/* Delivery Info */}
          <div className='mt-6 p-4 bg-green-50 rounded-xl border border-green-200'>
            <div className='flex items-center space-x-2 text-green-700 mb-2'>
              <span>🚚</span>
              <span className='font-semibold'>Estimated Delivery</span>
            </div>
            <p className='text-green-600 text-sm'>30-45 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;