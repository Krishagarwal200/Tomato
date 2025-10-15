import React, { useContext, useEffect, useState, useCallback } from 'react'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const MyOrders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const { url, token } = useContext(StoreContext);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${url}/api/order/user-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setData(response.data.orders || []);
      } else {
        setError(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [url, token]);

  useEffect(() => {
    fetchOrders();

    // Refresh orders every 30 seconds to get status updates
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderDetails = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  // Status configuration
  const statusConfig = {
    pending: {
      label: 'Order Placed',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      progress: 0
    },
    confirmed: {
      label: 'Order Confirmed',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      progress: 25
    },
    preparing: {
      label: 'Food Preparing',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      progress: 50
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      progress: 75
    },
    delivered: {
      label: 'Delivered',
      color: 'bg-green-100 text-green-800 border-green-200',
      progress: 100
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800 border-red-200',
      progress: 0
    }
  };

  const getStatusInfo = (status) => {
    return statusConfig[status] || {
      label: status || 'Unknown',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      progress: 0
    };
  };

  // Render loading state
  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading your orders...</div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && data.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <div className="text-red-500 mb-4 text-lg">Error: {error}</div>
          <button
            onClick={fetchOrders}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render when no token
  if (!token) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-gray-500 text-xl mb-4">🔒</div>
          <div className="text-gray-700 mb-4 text-lg">Please log in to view your orders</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-600 mt-2">Track your food delivery orders</p>
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Refreshing...' : 'Refresh Orders'}
          </button>
        </div>

        {/* Orders List */}
        {data.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">No orders yet</h2>
            <p className="text-gray-500 mb-8">Your delicious food orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((order) => {
              const statusInfo = getStatusInfo(order.orderStatus);
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100"
                  onClick={() => openOrderDetails(order)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        Order #{order.orderNumber || order._id.substring(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Status Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Order Placed</span>
                      <span>Confirmed</span>
                      <span>Preparing</span>
                      <span>On the Way</span>
                      <span>Delivered</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${statusInfo.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Total Amount:</span>
                      <p className="text-lg font-semibold text-gray-800">${order.amount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Items:</span>
                      <p className="text-gray-800">{order.items?.length || 0} items</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Payment:</span>
                      <p className="text-gray-800 capitalize">{order.paymentMethod} • {order.paymentStatus}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-blue-600 text-sm font-medium hover:text-blue-700">
                      Click to view details →
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openOrderDetails(order);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Order #{selectedOrder.orderNumber || selectedOrder._id.substring(0, 8).toUpperCase()}
                  </h2>
                  <button
                    onClick={closeOrderDetails}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-600 mt-1">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="p-6">
                {/* Order Status */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Status</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-700">Current Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedOrder.orderStatus).color}`}>
                        {getStatusInfo(selectedOrder.orderStatus).label}
                      </span>
                    </div>

                    {/* Detailed Progress Bar */}
                    <div className="space-y-2">
                      {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].map((status, index) => {
                        const isCompleted = getStatusInfo(selectedOrder.orderStatus).progress >= getStatusInfo(status).progress;
                        const isCurrent = selectedOrder.orderStatus === status;
                        return (
                          <div key={status} className="flex items-center">
                            <div className={`w-3 h-3 rounded-full border-2 ${isCompleted ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'} ${isCurrent ? 'ring-2 ring-red-300' : ''}`}></div>
                            <div className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                            <span className={`text-sm ${isCompleted ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                              {getStatusInfo(status).label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <img
                            src={`${url}/images/${item.image}`}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/48?text=Food';
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Summary</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-800">
                        ${(selectedOrder.amount - 5 - (selectedOrder.amount * 0.1)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="text-gray-800">$5.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-800">${(selectedOrder.amount * 0.1).toFixed(2)}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-800">Total</span>
                      <span className="text-gray-800">${selectedOrder.amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Delivery Address</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium text-gray-800">{selectedOrder.address?.name}</p>
                    <p className="text-gray-600">{selectedOrder.address?.street}</p>
                    <p className="text-gray-600">
                      {selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.zipCode}
                    </p>
                    <p className="text-gray-600">Phone: {selectedOrder.address?.phone}</p>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Information</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="text-gray-800 capitalize">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-600">Payment Status</span>
                      <span className={`font-medium ${selectedOrder.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedOrder.paymentStatus?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={closeOrderDetails}
                  className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;