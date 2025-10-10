import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom'; // Remove Navigate import
import { StoreContext } from '../../context/StoreContext'; // Import directly from StoreContext

const Navbar = ({ setShowLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menu, setMenu] = useState('Home');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const menuItems = [
    { name: 'Home', href: '#home' },
    { name: 'Menu', href: '#menu' },
    { name: 'Mobile App', href: '#mobile-app' },
    { name: 'Contact Us', href: '#contact' }
  ];

  const handleItemClick = (itemName, itemHref) => {
    setMenu(itemName);
    setIsMenuOpen(false);

    // Smooth scroll to the section
    const element = document.querySelector(itemHref);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const { cartItems, token, settoken } = useContext(StoreContext); // Combine context calls

  const getTotalItems = () => {
    let total = 0;
    Object.values(cartItems).forEach(quantity => {
      total += quantity;
    });
    return total;
  };

  const handleLogout = () => {
    settoken('');
    localStorage.removeItem('token');
    navigate('/'); // Use navigate instead of useNavigate()
  };

  const GoToMyOrders = () => {
    navigate('/myorders'); // Use navigate function
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div>
            <Link
              to="/"
              onClick={() => handleItemClick('Home', '#home')}
            >
              <img
                src={assets.logo}
                alt="Logo"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Navigation Menu - Desktop */}
          <div className="hidden md:block">
            <ul className="flex space-x-8">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`font-medium px-3 py-2 rounded-lg transition-colors ${menu === item.name
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-700 hover:text-red-500'
                      }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleItemClick(item.name, item.href);
                    }}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-6">
            {/* Search Icon */}
            <button>
              <img
                src={assets.search_icon}
                alt="Search"
                className="h-5 w-5 hover:opacity-70"
              />
            </button>

            {/* Basket Icon */}
            <div className="relative">
              <Link to="/cart">
                <img
                  src={assets.basket_icon}
                  alt="Basket"
                  className="h-5 w-5 hover:opacity-70"
                />
              </Link>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {getTotalItems()}
              </div>
            </div>

            {/* Profile Icon with Dropdown */}
            {!token ? (
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                onClick={() => setShowLogin(true)}
              >
                Sign In
              </button>
            ) : (
              <div className="relative group">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                  <img
                    src={assets.profile_icon}
                    alt="Profile"
                    className="w-6 h-6"
                  />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
                      onClick={GoToMyOrders} // Use the function directly
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      My Orders
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
                      onClick={handleLogout} // Use the function directly
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <ul className="px-2 py-4 space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`block font-medium py-3 px-4 rounded-lg transition-colors ${menu === item.name
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-700 hover:text-red-500 hover:bg-gray-50'
                      }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleItemClick(item.name, itemHref);
                    }}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;