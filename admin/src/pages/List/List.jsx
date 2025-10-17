import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';

const List = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentStore, storeToken, url } = useContext(StoreContext);

  const fetchStoreProducts = async () => {
    try {
      setLoading(true);

      // Check if currentStore and id exist (using 'id' instead of '_id')
      if (!currentStore || !currentStore.id) {
        console.error('No store selected or store ID missing');
        console.log('Current store:', currentStore);
        setLoading(false);
        return;
      }

      console.log('Fetching products for store:', currentStore.id);

      // Fetch products specifically for this store
      const response = await axios.get(`${url}/api/food/store/${currentStore.id}`, {
        headers: {
          'Authorization': `Bearer ${storeToken}`
        }
      });

      if (response.data.success) {
        setList(response.data.foods || []);
      } else {
        toast.error('Failed to fetch store products');
        setList([]);
      }
    } catch (error) {
      console.error('Error fetching store products:', error);

      if (error.response?.status === 404) {
        // Store has no products yet
        setList([]);
        toast.info('No products found for this store');
      } else {
        toast.error('Error fetching store products');
        setList([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await axios.delete(`${url}/api/food/${id}`, {
        headers: {
          'Authorization': `Bearer ${storeToken}`
        }
      });

      if (response.data.success) {
        setList(prevList => prevList.filter(item => item._id !== id));
        toast.success('Product deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  useEffect(() => {
    fetchStoreProducts();
  }, [currentStore?.id]); // Use 'id' instead of '_id'

  // Debug currentStore
  useEffect(() => {
    console.log('Current Store:', currentStore);
    console.log('Store ID:', currentStore?.id); // Changed to 'id'
    console.log('Store Token:', storeToken);
  }, [currentStore, storeToken]);

  // Show loading state
  if (loading) {
    return (
      <div className='max-w-7xl mx-auto p-6'>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <span className="ml-4 text-gray-600">Loading products...</span>
        </div>
      </div>
    );
  }

  // If no currentStore or invalid store ID
  if (!currentStore || !currentStore.id) {
    return (
      <div className='max-w-7xl mx-auto p-6'>
        <div className='text-center py-16 bg-white rounded-2xl shadow-lg'>
          <div className='text-6xl mb-4'>🏪</div>
          <h2 className='text-2xl font-semibold text-gray-600 mb-4'>
            {!currentStore ? 'No Store Selected' : 'Invalid Store ID'}
          </h2>
          <p className='text-gray-500'>
            {!currentStore
              ? 'Please login as a store to view products'
              : 'Store information is incomplete. Please login again.'
            }
          </p>
          <div className="mt-4 text-sm text-gray-400">
            Store ID: {currentStore?.id || 'Not available'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>
            {currentStore.name} - Menu Items
          </h1>
          <p className='text-gray-600 mt-2'>
            Manage your restaurant menu items
            {currentStore.storeInfo?.category && (
              <span className='ml-2 bg-red-100 text-red-600 px-2 py-1 rounded text-sm'>
                {currentStore.storeInfo.category}
              </span>
            )}
          </p>
          <div className="text-xs text-gray-400 mt-1">
            Store ID: {currentStore.id}
          </div>
        </div>
        <div className='text-right'>
          <div className='text-sm text-gray-500 mb-2'>
            Total Items: <span className='font-semibold text-red-500'>{list.length}</span>
          </div>
          <button
            onClick={fetchStoreProducts}
            className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors'
          >
            Refresh
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl shadow-lg'>
          <div className='text-6xl mb-4'>🍕</div>
          <h2 className='text-2xl font-semibold text-gray-600 mb-4'>No Menu Items Found</h2>
          <p className='text-gray-500'>
            This store has no products yet. Add some items to your menu to get started.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {list.map(item => (
            <div key={item._id} className='bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300'>
              {/* Image */}
              <div className='h-48 overflow-hidden'>
                <img
                  src={item.image ? `${url}/images/${item.image}` : '/placeholder-food.jpg'}
                  alt={item.name}
                  className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                  onError={(e) => {
                    e.target.src = '/placeholder-food.jpg';
                  }}
                />
              </div>

              {/* Content */}
              <div className='p-6'>
                <div className='flex justify-between items-start mb-3'>
                  <h3 className='text-xl font-bold text-gray-800'>{item.name}</h3>
                  <span className='font-bold text-red-500 text-lg'>${item.price}</span>
                </div>

                <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                  {item.description || 'No description available'}
                </p>

                <div className='flex justify-between items-center mb-4'>
                  <span className='bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium'>
                    {item.category || 'Uncategorized'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${item.isAvailable !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {item.isAvailable !== false ? 'Available' : 'Disabled'}
                  </span>
                </div>

                {/* Actions */}
                <div className='flex space-x-2 pt-4 border-t border-gray-100'>
                  <button
                    className='flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2'
                    onClick={() => toast.info('Edit functionality coming soon!')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    className='flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2'
                    onClick={() => handleDelete(item._id)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default List;