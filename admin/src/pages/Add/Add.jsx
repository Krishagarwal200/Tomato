import React, { useState } from 'react'
import { assets } from '../../assets/assets'
import axios from 'axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Add = () => {

  const navigate = useNavigate();
  const [image, setImage] = useState(false);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { storeToken, currentStore, url } = useContext(StoreContext);

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  // Function to clear form
  const clearForm = () => {
    setProductData({
      name: "",
      description: "",
      price: "",
      category: "Salad"
    });
    setImage(false);
    setMessage("");
    // Clear file input
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = "";
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Check if store is logged in
    if (!storeToken || !currentStore) {
      setMessage("Please login as a store to add products");
      toast.error("Store authentication required");
      return;
    }

    // Validation
    if (!image) {
      setMessage("Please upload an image");
      return;
    }

    if (!productData.name || !productData.description || !productData.price) {
      setMessage("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("description", productData.description);
      formData.append("price", Number(productData.price));
      formData.append("category", productData.category);
      formData.append("image", image);

      console.log("Sending request with store token:", storeToken);
      console.log("Current store:", currentStore.name);

      const response = await axios.post(`${url}/api/food/store/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${storeToken}`, // Use Authorization header
        }
      });

      console.log("Response:", response.data);

      // Check success
      if (response.data.success) {
        setMessage("Product added successfully!");
        clearForm();
        toast.success("Product added successfully!");
      } else {
        setMessage(response.data.message || "Failed to add product");
        toast.error("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);

      if (error.response) {
        // Server responded with error status
        const errorMsg = error.response.data.error || error.response.data.message || error.response.statusText;
        setMessage(`Error: ${errorMsg}`);
        toast.error(`Error: ${errorMsg}`);

        // Specific error handling
        if (error.response.status === 401) {
          setMessage("Store authentication failed. Please login again.");
        } else if (error.response.status === 404) {
          setMessage("Store not found. Please check your store account.");
        }
      } else if (error.request) {
        // Request was made but no response received
        setMessage("Network error: Could not connect to server");
        toast.error("Network error: Could not connect to server");
      } else {
        // Something else happened
        setMessage("Error: " + error.message);
        toast.error("Error: " + error.message);
      }
    } finally {
      setLoading(false);
      navigate("/store/dashboard");
    }
  };

  // Show store info if logged in
  const StoreInfo = () => {
    if (!currentStore) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-800">Adding product to: {currentStore.name}</h3>
            <p className="text-blue-600 text-sm">{currentStore.email}</p>
            {currentStore.storeInfo?.category && (
              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mt-1">
                {currentStore.storeInfo.category}
              </span>
            )}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${currentStore.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {currentStore.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-3xl font-bold text-gray-800 mb-2'>Add New Product</h1>
      <p className='text-gray-600 mb-8'>Add a new item to your restaurant menu</p>

      {/* Store Info */}
      <StoreInfo />

      {/* Store Not Logged In Warning */}
      {(!storeToken || !currentStore) && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6'>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-yellow-700">You need to be logged in as a store to add products.</span>
          </div>
        </div>
      )}

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl ${message.includes("successfully")
          ? 'bg-green-100 text-green-700 border border-green-200'
          : message.includes("Error") || message.includes("Failed")
            ? 'bg-red-100 text-red-700 border border-red-200'
            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
          }`}>
          {message}
        </div>
      )}

      <form onSubmit={onSubmitHandler} className='bg-white rounded-2xl shadow-lg p-6'>
        {/* Image Upload Section */}
        <div className='mb-8'>
          <label className='block text-sm font-medium text-gray-700 mb-4'>
            Product Image *
          </label>
          <div className='flex items-center justify-center'>
            <label htmlFor='image-upload' className='cursor-pointer'>
              <div className='border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-red-400 transition-colors duration-200'>
                {image ? (
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className='w-48 h-48 object-cover rounded-xl mx-auto'
                  />
                ) : (
                  <>
                    <img
                      src={assets.upload_area}
                      alt="Upload"
                      className='w-24 h-24 mx-auto mb-4 opacity-60'
                    />
                    <p className='text-gray-500'>Click to upload product image</p>
                    <p className='text-gray-400 text-sm mt-2'>PNG, JPG, WEBP up to 10MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                id="image-upload"
                hidden
                onChange={onImageChange}
                accept="image/*"
                disabled={!storeToken || !currentStore}
              />
            </label>
          </div>
        </div>

        {/* Product Details */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Product Name */}
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Product Name *
            </label>
            <input
              type='text'
              name='name'
              value={productData.name}
              onChange={onChangeHandler}
              placeholder='Enter product name'
              required
              disabled={!storeToken || !currentStore}
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed'
            />
          </div>

          {/* Product Description */}
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Product Description *
            </label>
            <textarea
              name='description'
              value={productData.description}
              onChange={onChangeHandler}
              placeholder='Enter product description'
              required
              rows='4'
              disabled={!storeToken || !currentStore}
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed'
            />
          </div>

          {/* Price */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Price ($) *
            </label>
            <input
              type='number'
              name='price'
              value={productData.price}
              onChange={onChangeHandler}
              placeholder='0.00'
              min='0'
              step='0.01'
              required
              disabled={!storeToken || !currentStore}
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed'
            />
          </div>

          {/* Category */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Category *
            </label>
            <select
              name='category'
              value={productData.category}
              onChange={onChangeHandler}
              required
              disabled={!storeToken || !currentStore}
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed'
            >
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex space-x-4 mt-8 pt-6 border-t border-gray-200'>
          <button
            type='submit'
            disabled={loading || !storeToken || !currentStore}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${loading || !storeToken || !currentStore
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
              }`}
          >
            {loading ? 'Adding Product...' :
              !storeToken || !currentStore ? 'Store Login Required' : 'Add Product'}
          </button>
          <button
            type='button'
            onClick={clearForm}
            disabled={loading || !storeToken || !currentStore}
            className='flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed'
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  )
}

export default Add