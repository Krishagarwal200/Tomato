import React, { useContext, useState, useEffect } from 'react'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Dashboard = () => {
  const { url, setToken, currentStore } = useContext(StoreContext)
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    pendingOrders: 0,
    todayOrders: 0
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        const storeToken = localStorage.getItem('storeToken')

        if (!storeToken) {
          navigate('/store/login')
          return
        }

        // Fetch store stats
        const statsResponse = await axios.get(`${url}/api/storeOrder/stats`, {
          headers: {
            'Authorization': `Bearer ${storeToken}`
          }
        })

        if (statsResponse.data.success) {
          const statsData = statsResponse.data.stats
          setStats({
            totalOrders: statsData.totalOrders || 0,
            totalRevenue: statsData.totalRevenue || 0,
            activeProducts: statsData.activeProducts || 0,
            pendingOrders: statsData.pendingOrders || 0,
            todayOrders: statsData.todayOrders || 0
          })
        }

        // Fetch recent orders
        const ordersResponse = await axios.get(`${url}/api/storeOrder/orders`, {
          headers: {
            'Authorization': `Bearer ${storeToken}`
          },
          params: {
            limit: 5,
            page: 1
          }
        })

        if (ordersResponse.data.success) {
          setRecentOrders(ordersResponse.data.orders || [])
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading store data:', error)
        setError('Failed to load dashboard data')
        setLoading(false)

        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          localStorage.removeItem('storeToken')
          localStorage.removeItem('storeInfo')
          navigate('/store/login')
        }
      }
    }

    if (currentStore) {
      loadStoreData()
    } else {
      // If no currentStore but token exists, try to get store info
      const storeToken = localStorage.getItem('storeToken')
      if (storeToken) {
        loadStoreData()
      } else {
        navigate('/store/login')
      }
    }
  }, [currentStore, url, navigate])

  const handleLogout = () => {
    localStorage.removeItem('storeToken')
    localStorage.removeItem('storeInfo')
    setToken('')
    navigate('/store/login')
  }

  const handleManageProducts = () => {
    navigate('/list')
  }

  const handleManageOrders = () => {
    navigate('/orders')
  }

  const handleAddProduct = () => {
    navigate('/add')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatOrderStatus = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      out_for_delivery: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }

    const statusText = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }

    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusText[status] || status}
      </span>
    )
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!currentStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Store Not Found</h2>
          <button
            onClick={() => navigate('/store/login')}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Store Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {currentStore.name}
              </p>
              {currentStore.storeInfo?.category && (
                <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium mt-2">
                  {currentStore.storeInfo.category}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>

            {/* Today's Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.todayOrders}</p>
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={handleAddProduct}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer text-left"
            >
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add Product</h3>
                  <p className="text-gray-600 mt-1">Add new items to your menu</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleManageProducts}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer text-left"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Products</h3>
                  <p className="text-gray-600 mt-1">View and edit your menu items</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleManageOrders}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer text-left"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Orders</h3>
                  <p className="text-gray-600 mt-1">Process and track orders</p>
                </div>
              </div>
            </button>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent orders</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {order.user?.name || 'Customer'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.items?.length || 0} items • {formatCurrency(order.amount)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Order #{order.orderNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        {formatOrderStatus(order.orderStatus)}
                        <p className="text-sm text-gray-500 mt-1">
                          {formatTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard