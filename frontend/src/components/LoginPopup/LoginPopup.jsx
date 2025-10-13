import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios"

const LoginPopup = ({ setShowLogin }) => {
  const { url, token, setToken } = useContext(StoreContext)
  const [currState, setCurrState] = useState("Sign Up");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        alert("Please fill in all required fields");
        return;
      }

      if (currState === "Sign Up" && !formData.name) {
        alert("Please enter your name");
        return;
      }

      let newUrl = url;
      if (currState === "Login") {
        newUrl += "/api/user/login";
      } else {
        newUrl += "/api/user/register";
      }

      const response = await axios.post(newUrl, formData);

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        setShowLogin(false);
        // console.log(response.data.token); 4
        // Reset form
        setFormData({
          name: "",
          email: "",
          password: ""
        });
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const switchMode = () => {
    setCurrState(currState === "Login" ? "Sign Up" : "Login");
    setFormData({
      name: "",
      email: "",
      password: ""
    });
  }

  return (
    <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm transform transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {currState === "Login" ? "Welcome Back" : "Create Account"}
          </h2>
          <button
            onClick={() => setShowLogin(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onLogin} className="p-5 space-y-3">
          {/* Name Field - Only show for Sign Up */}
          {currState === "Sign Up" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm disabled:opacity-50"
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm disabled:opacity-50"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm disabled:opacity-50"
            />
          </div>

          {/* Terms - Only show for Sign Up */}
          {currState === "Sign Up" && (
            <div className="flex items-center">
              <input
                type="checkbox"
                required
                disabled={loading}
                className="w-3 h-3 text-red-500 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50"
              />
              <label className="ml-2 text-xs text-gray-600">
                I agree to the terms and conditions
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 rounded-lg font-semibold transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : (currState === "Login" ? "Login" : "Create Account")}
          </button>

          {/* Switch between Login and Sign Up */}
          <div className="text-center pt-3">
            <p className="text-xs text-gray-600">
              {currState === "Login" ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={switchMode}
                disabled={loading}
                className="ml-1 text-red-500 hover:text-red-600 font-semibold transition-colors duration-200 text-xs disabled:opacity-50"
              >
                {currState === "Login" ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-3">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-3 text-gray-500 text-xs">Or continue with</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Social Login */}
          <div className="flex justify-center space-x-3">
            <button
              type="button"
              disabled={loading}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            >
              <img src={assets.google_icon} alt="Google" className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={loading}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            >
              <img src={assets.facebook_icon} alt="Facebook" className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPopup;