import React from 'react'
import { assets } from '../../assets/assets'

const AppDownload = () => {
  return (
    <div className='my-20 px-4' id="mobile-app">
      <div className='max-w-6xl mx-auto text-center'>
        {/* Heading */}
        <h2 className='text-4xl md:text-5xl font-bold text-gray-800 mb-4'>
          For Better Experience Download
          <span className='block text-red-500 mt-2'>Our App</span>
        </h2>

        <p className='text-lg text-gray-600 mb-8 max-w-2xl mx-auto'>
          Get exclusive offers, faster ordering, and personalized recommendations with our mobile app.
        </p>

        {/* App Store Buttons */}
        <div className='flex flex-col sm:flex-row justify-center items-center gap-6 mt-8'>
          <a
            href="#"
            className='transform transition-all duration-300 hover:scale-105 hover:shadow-2xl'
          >
            <img
              src={assets.play_store}
              alt="Get it on Google Play"
              className='h-14 md:h-16 rounded-2xl shadow-lg'
            />
          </a>

          <a
            href="#"
            className='transform transition-all duration-300 hover:scale-105 hover:shadow-2xl'
          >
            <img
              src={assets.app_store}
              alt="Download on the App Store"
              className='h-14 md:h-16 rounded-2xl shadow-lg'
            />
          </a>
        </div>

        {/* Additional Features */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto'>
          <div className='text-center p-6 rounded-2xl bg-red-50 hover:bg-red-100 transition-colors duration-300'>
            <div className='text-3xl mb-4'>🚀</div>
            <h3 className='text-xl font-semibold text-gray-800 mb-2'>Fast Ordering</h3>
            <p className='text-gray-600'>Order your favorite food in just a few taps</p>
          </div>

          <div className='text-center p-6 rounded-2xl bg-red-50 hover:bg-red-100 transition-colors duration-300'>
            <div className='text-3xl mb-4'>🎁</div>
            <h3 className='text-xl font-semibold text-gray-800 mb-2'>Exclusive Offers</h3>
            <p className='text-gray-600'>Get app-only discounts and promotions</p>
          </div>

          <div className='text-center p-6 rounded-2xl bg-red-50 hover:bg-red-100 transition-colors duration-300'>
            <div className='text-3xl mb-4'>⭐</div>
            <h3 className='text-xl font-semibold text-gray-800 mb-2'>Easy Tracking</h3>
            <p className='text-gray-600'>Real-time order tracking and updates</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppDownload