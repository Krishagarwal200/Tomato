import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'

const Sidebar = () => {
  const [activeOption, setActiveOption] = useState('add');

  const sidebarOptions = [
    { id: 'add', icon: assets.add_icon, label: 'Add Items', path: '/add' },
    { id: 'list', icon: assets.parcel_icon, label: 'List Items', path: '/list' },
    { id: 'orders', icon: assets.order_icon, label: 'Orders', path: '/orders' }
  ];

  return (
    <div className='w-64 bg-white shadow-lg h-screen sticky top-0'>
      <div className='p-6'>
        {/* Sidebar Header */}
        <div className='mb-8'>
          <h2 className='text-xl font-bold text-gray-800'>Admin Dashboard</h2>
          <p className='text-gray-500 text-sm'>Manage your restaurant</p>
        </div>

        {/* Sidebar Options */}
        <div className='space-y-2'>
          {sidebarOptions.map((option) => (
            <NavLink
              to={option.path}
              key={option.id}
              onClick={() => setActiveOption(option.id)}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${isActive || activeOption === option.id
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`
              }
            >
              <img
                src={option.icon}
                alt={option.label}
                className={`w-5 h-5 ${(activeOption === option.id) ? 'filter brightness-0 invert' : ''}`}
              />
              <span className='font-medium'>{option.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Quick Stats */}
        <div className='mt-8 pt-6 border-t border-gray-200'>
          <h3 className='text-sm font-semibold text-gray-600 mb-3'>Quick Stats</h3>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Total Orders</span>
              <span className='font-semibold'>128</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Pending</span>
              <span className='font-semibold text-orange-500'>12</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Completed</span>
              <span className='font-semibold text-green-500'>116</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar