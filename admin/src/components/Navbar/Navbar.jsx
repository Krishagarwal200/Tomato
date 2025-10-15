import React, { useState } from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'

const Navbar = ({ setStoreLogin }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()
  const { token, setToken } = useContext(StoreContext)

  const handleProfileClick = () => {
    setStoreLogin(true)
    setShowDropdown(false)
  }

  const handleAdminLogin = () => {
    // Navigate to admin login or show admin login modal
    console.log('Admin login clicked')
    setShowDropdown(false)
  }

  const handleLogout = () => {
    // Clear token and user data
    localStorage.removeItem('storeToken')
    setToken('')
    setShowDropdown(false)
    console.log('Logged out successfully')
    navigate("/");
  }

  const handleLogoClick = () => {
    const token = localStorage.getItem('token');
    console.log(token);
    navigate('/store/dashboard')
    setStoreLogin(false)
  }

  return (
    <nav className='bg-white shadow-md border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo and Brand */}
          <div className='flex items-center space-x-4'>
            <img
              src={assets.logo}
              alt="Tomato Admin"
              className='h-8 w-auto cursor-pointer'
              onClick={handleLogoClick}
            />
            <span className='text-xl font-bold text-gray-800'>Admin Panel</span>
          </div>

          {/* Profile with Dropdown */}
          <div className='relative'>
            <div
              className='flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors'
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className='text-gray-700 font-medium'>
                {token ? 'Admin User' : 'Guest'}
              </span>
              <img
                className='h-8 w-8 rounded-full object-cover border-2 border-gray-300'
                src={assets.profile_image}
                alt="Profile"
              />
              {/* Dropdown Arrow */}
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className='absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50'>

                {/* Store Login Option - Always visible */}
                <button
                  onClick={handleProfileClick}
                  className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2'
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Switch to Store Login</span>
                </button>

                <div className='border-t border-gray-100 my-1'></div>

                {/* Conditional rendering based on token */}
                {token ? (
                  // Logout option when token exists
                  <button
                    onClick={handleLogout}
                    className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors flex items-center space-x-2'
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                ) : (
                  // Admin Login option when no token
                  <button
                    onClick={handleAdminLogin}
                    className='w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 transition-colors flex items-center space-x-2'
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Admin Login</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  )
}

export default Navbar