import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const StoreDetails = () => {
  const { url, token, addToCart, decreaseCartItem, updatingCart, setUpdatingCart, cartItems, removeFromCart } = useContext(StoreContext);
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [storeItems, setStoreItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addingToCart, setAddingToCart] = useState({});


  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch store details
        const storeResponse = await axios.get(`${url}/api/stores/${storeId}`);

        if (storeResponse.data.success) {
          setStore(storeResponse.data.store);

          // Fetch store items
          try {
            const itemsResponse = await axios.get(`${url}/api/food/store/${storeId}`);
            if (itemsResponse.data.success) {
              setStoreItems(itemsResponse.data.foods || []);
            }
          } catch (itemsError) {
            console.error('Error fetching store items:', itemsError);
            // Try alternative endpoint
            try {
              const altResponse = await axios.get(`${url}/api/food/list`);
              if (altResponse.data.success) {
                // Filter items by store if possible
                const foods = altResponse.data.foods || altResponse.data.data || [];
                const storeItems = foods.filter(item => item.store === storeId);
                setStoreItems(storeItems);
              }
            } catch (altError) {
              console.error('Error with alternative endpoint:', altError);
              // Continue with empty items
              setStoreItems([]);
            }
          }
        } else {
          setError('Store not found');
        }
      } catch (error) {
        console.error('Error fetching store details:', error);
        setError('Failed to load store details');
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStoreDetails();
    }
  }, [storeId, url]);

  // Get unique categories from items
  const categories = ['All', ...new Set(storeItems.map(item => item?.category).filter(Boolean))];

  // Filter items by category
  const filteredItems = selectedCategory === 'All'
    ? storeItems
    : storeItems.filter(item => item?.category === selectedCategory);



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 mb-4">{error || 'Store not found'}</p>
            <button
              onClick={() => navigate('/stores')}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Stores
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/stores')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Stores
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>

              {store.storeInfo?.category && (
                <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {store.storeInfo.category}
                </span>
              )}

              {store.storeInfo?.description && (
                <p className="text-gray-600 text-lg mb-4">{store.storeInfo.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {store.storeInfo?.address && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {store.storeInfo.address}
                  </div>
                )}

                {store.storeInfo?.phone && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {store.storeInfo.phone}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${store.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                {store.isActive ? '🟢 Open' : '🔴 Closed'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Items Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Items Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Menu Items</h2>
          <p className="text-gray-600">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-4">No items available</p>
            <p className="text-gray-400">Check back later for new items</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => {
              const itemId = item._id || item.id;
              const isAdding = addingToCart[itemId];

              return (
                <div
                  key={itemId}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  {/* Item Image */}
                  <div className="h-48 bg-gray-200 relative">
                    {item.image ? (
                      <img
                        src={`${url}/images/${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-food.jpg';
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Category Badge */}
                    {item.category && (
                      <span className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.name}</h3>

                    {item.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-red-600">
                        ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Decrease Button */}
                        <button
                          onClick={() => decreaseCartItem(item._id)}
                          disabled={updatingCart[item._id] || !cartItems[item._id]}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${updatingCart[item._id] || !cartItems[item._id]
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                            }`}
                        >
                          {updatingCart[item._id] ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            '-'
                          )}
                        </button>

                        {/* Quantity Display */}
                        <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium min-w-[40px] text-center">
                          {cartItems[item._id]?.quantity || 0}
                        </span>

                        {/* Increase Button */}
                        <button
                          onClick={() => addToCart(item)}
                          disabled={updatingCart[item._id] || item.isAvailable === false}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${updatingCart[item._id] || item.isAvailable === false
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                        >
                          {updatingCart[item._id] ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            '+'
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeFromCart(item._id)}
                          disabled={updatingCart[item._id] || !cartItems[item._id]}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${updatingCart[item._id] || !cartItems[item._id]
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                          title="Remove from cart"
                        >
                          {updatingCart[item._id] ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetails;