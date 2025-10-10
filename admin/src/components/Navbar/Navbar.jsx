import React from 'react'
import { assets } from '../../assets/assets'

const Navbar = () => {
  return (
    <nav className='bg-white shadow-md border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo and Brand */}
          <div className='flex items-center space-x-4'>
            <img
              src={assets.logo}
              alt="Tomato Admin"
              className='h-8 w-auto'
            />
            <span className='text-xl font-bold text-gray-800'>Admin Panel</span>
          </div>

          {/* Profile */}
          <div className='flex items-center space-x-4'>
            <span className='text-gray-700 font-medium'>Admin User</span>
            <img
              className='h-8 w-8 rounded-full object-cover border-2 border-gray-300'
              src={assets.profile_image}
              alt="Profile"
            />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar