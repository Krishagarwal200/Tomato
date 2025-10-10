import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-white pt-12 pb-8' id="contact">
      <div className='max-w-7xl mx-auto px-4'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>

          {/* Logo and Social Media */}
          <div className='lg:col-span-1'>
            <img
              src={assets.logo}
              alt="Company Logo"
              className='h-10 mb-6'
            />
            <p className='text-gray-400 mb-6 leading-relaxed'>
              Delivering delicious meals with love and passion. Your satisfaction is our priority.
            </p>
            <div className='flex space-x-4'>
              <img
                src={assets.facebook_icon}
                alt="Facebook"
                className='h-8 w-8 cursor-pointer hover:scale-110 transition-transform duration-300'
              />
              <img
                src={assets.twitter_icon}
                alt="Twitter"
                className='h-8 w-8 cursor-pointer hover:scale-110 transition-transform duration-300'
              />
              <img
                src={assets.linkedin_icon}
                alt="LinkedIn"
                className='h-8 w-8 cursor-pointer hover:scale-110 transition-transform duration-300'
              />
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h2 className='text-xl font-bold mb-6 text-white'>Company</h2>
            <ul className='space-y-3'>
              {['Home', 'About us', 'Delivery', 'Privacy policy'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className='text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer'
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h2 className='text-xl font-bold mb-6 text-white'>Get in Touch</h2>
            <ul className='space-y-3'>
              {['Contact', 'Support', 'Help', 'FAQ'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className='text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer'
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className='text-xl font-bold mb-6 text-white'>Contact Info</h2>
            <div className='space-y-3 text-gray-400'>
              <p className='flex items-center'>
                <span className='mr-2'>📞</span>
                +1 234 567 890
              </p>
              <p className='flex items-center'>
                <span className='mr-2'>📧</span>
                hello@foodapp.com
              </p>
              <p className='flex items-center'>
                <span className='mr-2'>📍</span>
                123 Food Street, City, Country
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-gray-700 pt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-gray-400 text-center md:text-left mb-4 md:mb-0'>
              Copyright &copy; 2025 FoodApp. All rights reserved.
            </p>
            <div className='flex space-x-6 text-sm text-gray-400'>
              <a href="#" className='hover:text-white transition-colors duration-300'>Terms of Service</a>
              <a href="#" className='hover:text-white transition-colors duration-300'>Privacy Policy</a>
              <a href="#" className='hover:text-white transition-colors duration-300'>Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer >
  )
}

export default Footer