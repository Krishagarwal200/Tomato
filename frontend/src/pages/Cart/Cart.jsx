import React, { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, food_list, removeFromCart, addToCart, url } = useContext(StoreContext);

  // Calculate totals
  const getTotalCartAmount = () => {
    let total = 0;
    food_list.forEach(item => {
      if (cartItems[item._id] > 0) {
        total += item.price * cartItems[item._id];
      }
    });
    return total;
  };

  const getTotalItems = () => {
    let total = 0;
    Object.values(cartItems).forEach(quantity => {
      total += quantity;
    });
    return total;
  };

  const deliveryFee = getTotalCartAmount() > 0 ? 5 : 0;

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      <h1 className='text-4xl font-bold text-gray-800 mb-8 text-center'>Your Cart</h1>

      {getTotalItems() === 0 ? (
        // Empty Cart State
        <div className='text-center py-16'>
          <div className='text-6xl mb-4'>🛒</div>
          <h2 className='text-2xl font-semibold text-gray-600 mb-4'>Your cart is empty</h2>
          <p className='text-gray-500 mb-8'>Add some delicious items to get started!</p>
          <Link to="/" className='bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300'>
            Browse Menu
          </Link>
        </div >
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

              {/* Cart Items List */}
              <div className='space-y-4'>
                {food_list.map((item) => {
                  if (cartItems[item._id] > 0) {
                    return (
                      <div key={item._id} className='grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-100'>
                        {/* Item Image & Name */}
                        <div className='col-span-5 flex items-center space-x-4'>
                          <img
                            src={url + "/images/" + item.image}
                            alt={item.name}
                            className='w-16 h-16 rounded-xl object-cover'
                          />
                          <div>
                            <h3 className='font-semibold text-gray-800'>{item.name}</h3>
                            <p className='text-sm text-gray-500'>{item.category}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className='col-span-2 text-center'>
                          <p className='font-semibold text-gray-800'>${item.price}</p>
                        </div>

                        {/* Quantity Controls */}
                        <div className='col-span-3 flex justify-center items-center space-x-3'>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-500 hover:text-white transition-colors duration-200'
                          >
                            -
                          </button>
                          <span className='font-semibold text-gray-800 min-w-[2rem] text-center'>
                            {cartItems[item._id]}
                          </span>
                          <button
                            onClick={() => addToCart(item._id)}
                            className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-500 hover:text-white transition-colors duration-200'
                          >
                            +
                          </button>
                        </div>

                        {/* Total */}
                        <div className='col-span-2 text-right'>
                          <p className='font-semibold text-gray-800'>
                            ${(item.price * cartItems[item._id]).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
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
                  <span>Items ({getTotalItems()})</span>
                  <span>${getTotalCartAmount().toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-gray-600'>
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-gray-600'>
                  <span>Tax</span>
                  <span>${(getTotalCartAmount() * 0.1).toFixed(2)}</span>
                </div>
                <hr className='border-gray-200' />
                <div className='flex justify-between text-lg font-bold text-gray-800'>
                  <span>Total</span>
                  <span>${(getTotalCartAmount() + deliveryFee + (getTotalCartAmount() * 0.1)).toFixed(2)}</span>
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
    </div >
  )
}

export default Cart