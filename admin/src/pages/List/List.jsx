import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const YourComponent = () => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/food/list'); // Changed to http
      if (response.data.success) {
        const data = response.data.foods;
        setList(data);
      }

      // toast.success('List fetched successfully');
    } catch (error) {
      toast.error('Error fetching list');
      console.log(error);
    }
  }
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:4000/api/food/${id}`); // Changed to http
      if (response.data.success) {
        fetchList();
        toast.success('Item deleted successfully');
      }
    } catch (error) {
      toast.error('Error deleting item');
      console.log(error);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Food Items</h1>
          <p className='text-gray-600 mt-2'>Manage your restaurant menu items</p>
        </div>
        <div className='text-sm text-gray-500'>
          Total Items: <span className='font-semibold text-red-500'>{list.length}</span>
        </div>
      </div>

      {list.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl shadow-lg'>
          <div className='text-6xl mb-4'>🍕</div>
          <h2 className='text-2xl font-semibold text-gray-600 mb-4'>No Items Found</h2>
          <p className='text-gray-500'>Add some items to your menu to get started</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {list.map(item => (
            <div key={item._id} className='bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300'>
              {/* Image */}
              <div className='h-48 overflow-hidden'>
                <img
                  src={`http://localhost:4000/images/` + item.image}
                  alt={item.name}
                  className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                />
              </div>

              {/* Content */}
              <div className='p-6'>
                <div className='flex justify-between items-start mb-3'>
                  <h3 className='text-xl font-bold text-gray-800'>{item.name}</h3>
                  <span className='font-bold text-red-500 text-lg'>${item.price}</span>
                </div>

                <p className='text-gray-600 text-sm mb-4 line-clamp-2'>{item.description}</p>

                <div className='flex justify-between items-center mb-4'>
                  <span className='bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium'>
                    {item.category}
                  </span>
                  <span className='text-xs text-gray-500'>ID: {item._id.slice(-6)}</span>
                </div>

                {/* Actions */}
                <div className='flex space-x-2 pt-4 border-t border-gray-100'>
                  <button className='flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2'>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button className='flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2' onClick={() => handleDelete(item._id)}>
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

export default YourComponent;