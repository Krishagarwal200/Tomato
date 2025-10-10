import React from 'react'
import { assets } from '../../assets/assets'

const Header = () => {
  return (
    <div className='flex justify-center items-center min-h-[500px] md:min-h-[600px] px-2 py-4' id="home">
      <style>
        {`
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
          .animation-delay-200 { animation-delay: 200ms; }
          .animation-delay-400 { animation-delay: 400ms; }
        `}
      </style>

      <div className='relative w-full max-w-7xl'>
        {/* Background Image Container */}
        <div className='relative w-[90%] mx-auto rounded-3xl overflow-hidden shadow-2xl'>
          <img
            src={assets.header_img}
            alt="Delicious food background"
            className='w-full h-[450px] md:h-[550px] object-cover'
          />

          {/* Overlay */}
          <div className=''></div>
        </div>

        {/* Content */}
        <div className='absolute inset-0 flex flex-col justify-center items-center text-center px-4'>
          <h2 className='text-3xl md:text-5xl font-bold text-white mb-4 max-w-2xl leading-tight font-serif drop-shadow-lg animate-fade-in-up'>
            Order Your Favorite Food Here
          </h2>

          <p className='text-lg md:text-xl text-white mb-8 max-w-xl leading-relaxed font-medium drop-shadow-md animate-fade-in-up animation-delay-200'>
            Choose from a diverse variety of delicious dishes crafted with love
          </p>

          <button className='bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl animate-fade-in-up animation-delay-400'>
            <a href="#menu">View Menu</a>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header