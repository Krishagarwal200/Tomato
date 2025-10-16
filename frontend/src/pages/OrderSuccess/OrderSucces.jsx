import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orderData = location.state?.order;
  const message = location.state?.message;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (orderData) {
          // If order data is passed via state, use it
          setOrder(orderData);
          setLoading(false);
        } else {
          // If no order data, try to get from URL params or localStorage
          const urlParams = new URLSearchParams(location.search);
          const orderId = urlParams.get('orderId');

          if (orderId) {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:4000/api/order/${orderId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.data.success) {
              setOrder(response.data.order);
            } else {
              setError('Order not found');
            }
          } else {
            setError('No order information available');
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderData, location.search]);

  const handleTrackOrder = () => {
    if (order) {
      navigate('/myorders', { state: { orderId: order._id } });
    }
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to retrieve order information.'}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Continue Shopping
            </button>
            <Link
              to="/orders"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors text-center"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for your order!
          </p>
          {message && (
            <p className="text-lg text-green-600 font-semibold">{message}</p>
          )}
          <p className="text-gray-500 mt-2">
            We've sent a confirmation email with your order details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Order Information</h3>
                  <p className="text-gray-600">
                    <span className="font-medium">Order #:</span> {order.orderNumber || order._id?.substring(0, 8).toUpperCase()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Time:</span> {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Payment & Status</h3>
                  <p className="text-gray-600">
                    <span className="font-medium">Payment:</span>
                    <span className={`ml-2 font-semibold ${order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                      {order.paymentStatus?.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 font-semibold ${order.orderStatus === 'delivered' ? 'text-green-600' :
                      order.orderStatus === 'cancelled' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                      {order.orderStatus?.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Method:</span> {order.paymentMethod?.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center space-x-4">
                        {item.image && (
                          <img
                            src={`http://localhost:4000/images/${item.image}`}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">${item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-2xl text-green-600">${order.amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delivery Information</h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Name:</span> {order.address?.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Address:</span> {order.address?.street}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">City:</span> {order.address?.city}, {order.address?.state} {order.address?.zipCode}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Phone:</span> {order.address?.phone}
                </p>
              </div>

              {order.estimatedDeliveryTime && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 font-medium">
                    🚚 Estimated delivery: {order.estimatedDeliveryTime} minutes
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Next Steps */}
          <div className="space-y-6">
            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Confirmation</p>
                    <p className="text-sm text-gray-600">You'll receive an email confirmation shortly</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 font-semibold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Preparation</p>
                    <p className="text-sm text-gray-600">The restaurant is preparing your food</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-semibold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Delivery</p>
                    <p className="text-sm text-gray-600">Your food will be delivered to your address</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleTrackOrder}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Track Your Order
                </button>

                <button
                  onClick={handleContinueShopping}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue Shopping
                </button>

                <Link
                  to="/myorders"
                  className="block w-full text-center border border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                >
                  View All Orders
                </Link>
              </div>
            </div>

            {/* Support */}


          </div>
        </div>
      </div>
    </div >
  );
};

export default OrderSuccess;