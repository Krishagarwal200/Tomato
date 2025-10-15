// Verify.jsx
import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { url, token } = useContext(StoreContext);

  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

  // In your verification page (Verify.jsx or similar)
  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('orderId');
      const sessionId = urlParams.get('session_id');
      const success = urlParams.get('success');

      console.log('🔍 Frontend verification params:', { orderId, sessionId, success });

      if (orderId && sessionId && success === 'true') {
        try {
          const response = await axios.post(`${url}/api/order/verify`, {
            orderId,
            sessionId
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('🔍 Verification API response:', response.data);

          if (response.data.success) {
            // Success - update UI
            console.log('✅ Payment verified successfully');
          } else {
            console.log('❌ Payment verification failed:', response.data.message);
          }
        } catch (error) {
          console.error('❌ Verification API error:', error.response?.data || error.message);
        }
      }
    };

    verifyPayment();
  }, [url, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {success === 'true' ? (
          <div>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your order has been confirmed.</p>
            <button
              onClick={() => navigate('/myorders')}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
            >
              View Orders
            </button>
          </div>
        ) : (
          <div>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h2>
            <p className="text-gray-600 mb-4">Your payment was not successful. Please try again.</p>
            <button
              onClick={() => navigate('/cart')}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
            >
              Back to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;