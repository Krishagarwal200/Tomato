import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  const handleStoreLogin = () => {

    // Navigate to dashboard after login
    navigate('/store/login')
  }

  const handleRegister = () => {
    navigate('/store/register')
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">🍅</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Tomato Admin</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleStoreLogin}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Store Login
              </button>
              <button
                onClick={handleRegister}
                className="border border-red-500 text-red-500 hover:bg-red-50 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Register Store
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-white text-4xl">🍅</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Tomato Admin
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Manage your food delivery business efficiently with our comprehensive admin panel.
            Handle orders, manage your menu, and track performance all in one place.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-blue-600 text-xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Order Management</h3>
              <p className="text-gray-600">
                Process and track customer orders in real-time with status updates and notifications.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-green-600 text-xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Menu Management</h3>
              <p className="text-gray-600">
                Easily add, edit, or remove items from your menu with image uploads and pricing.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics & Reports</h3>
              <p className="text-gray-600">
                Get insights into your sales, popular items, and customer behavior with detailed analytics.
              </p>
            </div>
          </div>

          {/* Quick Start Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/store/login')}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              🚀 Get Started - Store Login
            </button>
            <button
              onClick={() => navigate('/store/register')}
              className="border-2 border-red-500 text-red-500 hover:bg-red-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              📝 Register New Store
            </button>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose Tomato Admin?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500 mb-2">500+</div>
                <div className="text-gray-600">Stores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500 mb-2">50K+</div>
                <div className="text-gray-600">Orders Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500 mb-2">99%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500 mb-2">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">🍅</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Tomato Admin</span>
            </div>
            <div className="text-gray-600">
              © 2024 Tomato Admin Panel. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home