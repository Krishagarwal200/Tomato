import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const url = 'http://localhost:4000';

  const statusOptions = [
    'pending',
    'confirmed',
    'preparing',
    'out_for_delivery',
    'delivered',
    'cancelled'
  ];

  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };

  const fetchAllOrders = async (status = 'all', page = 1) => {
    try {
      setLoading(true);
      const storeToken = localStorage.getItem('storeToken');

      if (!storeToken) {
        toast.error('Please login as store');
        return;
      }

      const response = await axios.get(`${url}/api/storeOrder/orders`, {
        headers: {
          'Authorization': `Bearer ${storeToken}`
        },
        params: {
          status,
          page,
          limit: 10
        }
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching store orders:', error);
      toast.error(error.response?.data?.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const storeToken = localStorage.getItem('storeToken');

      if (!storeToken) {
        toast.error('Please login as store');
        return;
      }

      const response = await axios.put(
        `${url}/api/storeOrder/${orderId}/status`,
        {
          status: newStatus
        },
        {
          headers: {
            'Authorization': `Bearer ${storeToken}`
          }
        }
      );

      if (response.data.success) {
        toast.success(`Order status updated to ${statusLabels[newStatus]}`);
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { ...order, orderStatus: newStatus }
              : order
          )
        );
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || "Error updating order status");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Store Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No orders found</p>
            <button
              onClick={() => fetchAllOrders()}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-6">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Order #{order.orderNumber || order._id?.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Date: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                    {order.user && (
                      <p className="text-sm text-gray-600 mt-1">
                        Customer: {order.user.name} ({order.user.email})
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${order.amount?.toFixed(2)}</p>
                    <p className={`text-sm font-medium ${order.paymentStatus === 'completed' ? 'text-green-600' :
                      order.paymentStatus === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                      {order.paymentStatus?.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Order Items:</h4>
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b">
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img
                              src={`${url}/images/${item.image}`}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Address:</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{order.address?.name}</p>
                    <p className="text-gray-600">{order.address?.street}</p>
                    <p className="text-gray-600">{order.address?.city}, {order.address?.state} {order.address?.zipCode}</p>
                    <p className="text-gray-600">Phone: {order.address?.phone}</p>
                  </div>
                </div>

                {/* Status Update */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-900">Current Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                        order.orderStatus === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                          order.orderStatus === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                      }`}>
                      {statusLabels[order.orderStatus] || order.orderStatus}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="font-medium text-gray-900">Update Status:</label>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">Special Instructions:</span> {order.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;