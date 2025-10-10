import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const url = 'http://localhost:4000';

  const statusOptions = [
    'Food Processing',
    'Out for Delivery',
    'Delivered'
  ];

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error('Error:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.post(`${url}/api/order/update-status`, {
        orderId,
        status: newStatus
      });

      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { ...order, status: newStatus }
              : order
          )
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating order status");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Orders</h1>

      {orders.map((order) => (
        <div key={order._id} className="border p-4 mb-4 rounded">
          {/* Order Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold">Order #{order._id?.substring(0, 8)}...</h3>
              <p className="text-sm text-gray-600">
                Date: {new Date(order.date?.$date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">${order.amount}</p>
              <p className={`text-sm ${order.payment ? 'text-green-600' : 'text-red-600'
                }`}>
                {order.payment ? 'Paid' : 'Unpaid'}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Items:</h4>
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm mb-1">
                <span>{item.name} (Qty: {item.quantity})</span>
                <span>${item.price}</span>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          <div className="mb-4">
            <h4 className="font-medium mb-1">Delivery Address:</h4>
            <p className="text-sm">{order.address?.name}</p>
            <p className="text-sm">{order.address?.street}</p>
            <p className="text-sm">{order.address?.city}, {order.address?.state} {order.address?.zipCode}</p>
            <p className="text-sm">Phone: {order.address?.phone}</p>
          </div>

          {/* Status Update */}
          <div>
            <label className="font-medium mr-2">Status:</label>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(order._id, e.target.value)}
              className="border p-1 rounded"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Order;