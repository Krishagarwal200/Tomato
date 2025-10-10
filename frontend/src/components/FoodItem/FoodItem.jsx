import React, { useContext, useState } from 'react'
import { StoreContext } from '../../context/StoreContext';

const FoodItem = ({ id, name, image, price, description, category }) => {



  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  return (
    <div className='group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 relative'>
      {/* Food Image with Overlay */}
      <div className='relative h-56 overflow-hidden'>
        <img
          src={url + "/images/" + image}
          alt={name}
          className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
        />
        {/* Gradient Overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
        {/* Category Badge */}
        <div className='absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-semibold'>
          {category}
        </div>
        {/* Price Tag */}
        <div className='absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg'>
          ${price}
        </div>
      </div>

      {/* Food Details */}
      <div className='p-6'>
        <div className='flex justify-between items-center mb-3'>
          <h3 className='text-xl font-bold text-gray-800 group-hover:text-red-500 transition-colors duration-300'>
            {name}
          </h3>
          {/* Count Display - Only shows when count > 0 */}

        </div>

        <p className='text-gray-600 text-sm mb-6 leading-relaxed line-clamp-2'>
          {description}
        </p>

        <div className='flex justify-between items-center'>
          {!cartItems[id] ? (
            <button
              onClick={() => addToCart(id)}
              className='flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-200 flex items-center justify-center gap-2'
            >
              <span>Add to Cart</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          ) : (
            <div className='flex items-center justify-between w-full bg-gray-100 rounded-xl p-1'>
              <button
                onClick={() => removeFromCart(id)}
                className='bg-white text-red-500 w-10 h-10 rounded-lg font-bold text-lg hover:bg-red-50 transition-colors duration-200 shadow-sm'
              >
                -
              </button>
              <span className='font-bold text-gray-800 mx-4'>{cartItems[id]}</span>
              <button
                onClick={() => addToCart(id)}
                className='bg-white text-red-500 w-10 h-10 rounded-lg font-bold text-lg hover:bg-red-50 transition-colors duration-200 shadow-sm'
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className='absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-red-200 transition-all duration-500 pointer-events-none'></div>
    </div>
  )
}

export default FoodItem