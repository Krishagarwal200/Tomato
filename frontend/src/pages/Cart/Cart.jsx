import React, { useContext, useEffect, useState } from 'react'
import { StoreContext } from '../../context/StoreContext'
import { Link } from 'react-router-dom';

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    addToCart,

    url,
    foodList,
    getTotalCartAmount,
    getTotalCartItems,
    updatingCart,
    decreaseCartItem,
    token,
    fetchFoodList,
    loadCartItems
  } = useContext(StoreContext);

  const [loading, setLoading] = useState(true);

  // Debug logging
  // console.log('🔍 Cart Debug:');
  // console.log('cartItems:', cartItems);
  // console.log('foodList length:', foodList.length);
  // console.log('token:', token);
  // console.log('getTotalCartItems():', getTotalCartItems());
  // console.log('getTotalCartAmount():', getTotalCartAmount());

  // Check what items are actually in cart
  const cartItemsArray = Object.keys(cartItems).map(itemId => {
    const cartItem = cartItems[itemId];
    const foodItem = foodList.find(item => item._id === itemId);

    return {
      itemId,
      quantity: cartItem.quantity,
      price: cartItem.price,
      name: cartItem.name,
      image: cartItem.image,
      // Use food item data if available, otherwise use cart item data
      displayName: foodItem ? foodItem.name : cartItem.name,
      displayPrice: foodItem ? foodItem.price : cartItem.price,
      displayImage: foodItem ? foodItem.image : cartItem.image,
      displayCategory: foodItem ? foodItem.category : 'Food',
      foodItem: foodItem // Keep reference to food item
    };
  });

  console.log('cartItemsArray:', cartItemsArray);

  const deliveryFee = getTotalCartAmount() > 0 ? 5 : 0;
  const taxRate = 0.1;

  // Reload data if foodList is empty but we have cart items
  useEffect(() => {
    const reloadData = async () => {
      if (getTotalCartItems() > 0 && foodList.length === 0) {
        console.log('🔄 Reloading food list and cart items...');
        setLoading(true);
        await fetchFoodList();
        await loadCartItems();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    reloadData();
  }, [foodList.length]);

  if (loading) {
    return (
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading cart...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      <h1 className='text-4xl font-bold text-gray-800 mb-8 text-center'>Your Cart</h1>

      {getTotalCartItems() === 0 ? (
        // Empty Cart State
        <div className='text-center py-16'>
          <div className='text-6xl mb-4'>🛒</div>
          <h2 className='text-2xl font-semibold text-gray-600 mb-4'>Your cart is empty</h2>
          <p className='text-gray-500 mb-8'>Add some delicious items to get started!</p>
          <Link
            to="/"
            className='bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300'
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Cart Items */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-2xl shadow-lg p-6'>
              {/* Cart Header */}
              <div className='grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 mb-4 text-sm font-semibold text-gray-600'>
                <div className='col-span-5'>ITEM</div>
                <div className='col-span-2 text-center'>PRICE</div>
                <div className='col-span-3 text-center'>QUANTITY</div>
                <div className='col-span-2 text-right'>TOTAL</div>
              </div>

              {/* Cart Items List - Using cartItemsArray */}
              <div className='space-y-4'>
                {cartItemsArray.map((cartItem) => (
                  <div key={cartItem.itemId} className='grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-100'>
                    {/* Item Image & Name */}
                    <div className='col-span-5 flex items-center space-x-4'>
                      <img
                        src={url + "/images/" + cartItem.displayImage}
                        alt={cartItem.displayName}
                        className='w-16 h-16 rounded-xl object-cover'
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64?text=Food';
                        }}
                      />
                      <div>
                        <h3 className='font-semibold text-gray-800'>{cartItem.displayName}</h3>
                        <p className='text-sm text-gray-500'>{cartItem.displayCategory}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className='col-span-2 text-center'>
                      <p className='font-semibold text-gray-800'>${cartItem.displayPrice.toFixed(2)}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className='col-span-3 flex justify-center items-center space-x-3'>
                      <button
                        onClick={() => decreaseCartItem(cartItem.itemId)}
                        disabled={updatingCart[cartItem.itemId]}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${updatingCart[cartItem.itemId]
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white'
                          }`}
                      >
                        {updatingCart[cartItem.itemId] ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          '-'
                        )}
                      </button>

                      <span className='font-semibold text-gray-800 min-w-[2rem] text-center'>
                        {cartItem.quantity}
                      </span>

                      <button
                        onClick={() => {
                          // If we have the food item, pass it, otherwise create a minimal object
                          const itemToAdd = cartItem.foodItem || {
                            _id: cartItem.itemId,
                            name: cartItem.displayName,
                            price: cartItem.displayPrice,
                            image: cartItem.displayImage
                          };
                          addToCart(itemToAdd);
                        }}
                        disabled={updatingCart[cartItem.itemId]}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${updatingCart[cartItem.itemId]
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-500 hover:text-white'
                          }`}
                      >
                        {updatingCart[cartItem.itemId] ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          '+'
                        )}
                      </button>
                    </div>

                    {/* Total */}
                    <div className='col-span-2 text-right'>
                      <p className='font-semibold text-gray-800'>
                        ${(cartItem.displayPrice * cartItem.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-2xl shadow-lg p-6 sticky top-8'>
              <h2 className='text-2xl font-bold text-gray-800 mb-6'>Order Summary</h2>

              {/* Order Details */}
              <div className='space-y-4 mb-6'>
                <div className='flex justify-between text-gray-600'>
                  <span>Items ({getTotalCartItems()})</span>
                  <span>${getTotalCartAmount().toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-gray-600'>
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-gray-600'>
                  <span>Tax (10%)</span>
                  <span>${(getTotalCartAmount() * taxRate).toFixed(2)}</span>
                </div>
                <hr className='border-gray-200' />
                <div className='flex justify-between text-lg font-bold text-gray-800'>
                  <span>Total</span>
                  <span>
                    ${(getTotalCartAmount() + deliveryFee + (getTotalCartAmount() * taxRate)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Promo Code */}
              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Promo Code</label>
                <div className='flex space-x-2'>
                  <input
                    type='text'
                    placeholder='Enter code'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  />
                  <button className='bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200'>
                    Apply
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                to="/order"
                className='block w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg mb-4 text-center'
              >
                Proceed to Checkout
              </Link>

              {/* Continue Shopping */}
              <Link
                to="/"
                className='block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors duration-200 text-center'
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart