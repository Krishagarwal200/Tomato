import React, { useState } from 'react'
import { assets } from '../../assets/assets'
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = () => {
  const url = "http://localhost:4000";
  const [image, setImage] = useState(false);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

    // Validation
    if (!image) {
      setMessage("Please upload an image");
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



      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });



      // Check different possible success indicators
      if (response.data.success || response.status === 200 || response.data.message?.includes('success')) {
        setMessage("Product added successfully!");
        clearForm(); // Clear form on success

        toast.success("Product added successfully!");
      } else {
        setMessage(response.data.message || "Failed to add product");
        toast.error("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      console.error("Error response:", error.response);

      if (error.response) {
        // Server responded with error status
        setMessage(`Error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        // Request was made but no response received
        setMessage("Network error: Could not connect to server");
      } else {
        // Something else happened
        setMessage("Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-3xl font-bold text-gray-800 mb-2'>Add New Product</h1>
      <p className='text-gray-600 mb-8'>Add a new item to your restaurant menu</p>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl ${message.includes("successfully")
          ? 'bg-green-100 text-green-700 border border-green-200'
          : 'bg-red-100 text-red-700 border border-red-200'
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
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200'
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
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none'
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
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200'
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
              className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200'
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
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${loading
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
              }`}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
          <button
            type='button'
            onClick={clearForm}
            disabled={loading}
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