import React, { useContext, useEffect, useState, useCallback } from 'react'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const MyOrders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { url, token } = useContext(StoreContext);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${url}/api/order/userorders`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setData(response.data.data || []);
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
  }, [fetchOrders]);

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div>Loading your orders...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Render when no token
  if (!token) {
    return (
      <div className="p-4">
        <div>Please log in to view your orders.</div>
      </div>
    );
  }

  // Render empty state
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="p-4">
        <div>No orders found.</div>
      </div>
    );
  }

  // Render orders
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Orders</h2>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Track Order
        </button>
      </div>

      <div className="space-y-4">
        {data.map((order) => (
          <div key={order._id || order.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">Order #{order._id?.substring(0, 8)}...</h3>
              <span className={`px-2 py-1 rounded text-sm ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Food Processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                {order.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <p>Items: {order.items?.length || 0}</p>
              <p>Total: ${order.amount || order.total || 'N/A'}</p>
              <p>Date: {new Date(order.createdAt || order.date).toLocaleDateString()}</p>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="mb-3">
                <h4 className="font-medium text-sm mb-2">Items:</h4>
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} (Qty: {item.quantity})</span>
                      <span>${item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Track Order Button for individual order */}
            <button
              onClick={fetchOrders}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              Refresh Status
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyOrders;