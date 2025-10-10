import React, { useContext, useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const { url, token } = useContext(StoreContext);

  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyOrder = async () => {
      console.log('=== VERIFICATION STARTED ===');
      console.log('Order ID:', orderId);
      console.log('Success param:', success);
      console.log('Token exists:', !!token);

      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        // If payment was successful, update order status
        if (success === 'true') {
          console.log('Payment successful, verifying order...');

          // ✅ FIXED: Changed to singular "order" to match backend
          const response = await axios.post(`${url}/api/order/verify`, {
            orderId: orderId,
            success: true
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Verification response:', response.data);

          if (response.data.success) {
            setOrderStatus('confirmed');
            // useNavigate("/myorders");
          } else {
            setOrderStatus('failed');
            setError(response.data.message || 'Payment verification failed');
            // useNavigate("/")
          }
        } else {
          // If payment was cancelled or failed
          console.log('Payment failed or cancelled');
          setOrderStatus('cancelled');

          // Also notify backend about cancellation
          try {
            await axios.post(`${url}/api/order/verify`, {
              orderId: orderId,
              success: false
            }, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          } catch (backendError) {
            console.error('Failed to notify backend about cancellation:', backendError);
          }
        }
      } catch (error) {
        console.error('Verification error:', error);

        // Detailed error logging
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error data:', error.response.data);
        } else if (error.request) {
          console.error('No response received');
        } else {
          console.error('Error message:', error.message);
        }

        setOrderStatus('error');
        setError(error.response?.data?.message || 'Failed to verify order. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [success, orderId, url, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Your Order</h2>
          <p className="text-gray-600">Please wait while we process your payment...</p>
        </div>
      </div>
    );
  }

  if (orderStatus === 'confirmed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Confirmed!</h1>
          <p className="text-gray-600 mb-2">Thank you for your order!</p>
          <p className="text-gray-600 mb-6">Your order has been successfully placed.</p>

          <div className="bg-gray-100 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono text-gray-800">{orderId}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-700 font-semibold">Estimated delivery: 30-45 minutes</p>
          </div>

          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors duration-200"
            >
              Continue Shopping
            </Link>
            <Link
              to="/cart"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderStatus === 'cancelled' || orderStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {orderStatus === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
          </h1>

          <p className="text-gray-600 mb-6">
            {orderStatus === 'cancelled'
              ? 'Your payment was cancelled. No charges were made.'
              : 'We encountered an issue processing your payment. Please try again.'
            }
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              to="/cart"
              className="block w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors duration-200"
            >
              Try Again
            </Link>
            <Link
              to="/"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">Verification Error</h1>
        <p className="text-gray-600 mb-6">
          {error || 'Unable to verify your order. Please contact support.'}
        </p>

        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors duration-200"
          >
            Back to Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

export default Verify;