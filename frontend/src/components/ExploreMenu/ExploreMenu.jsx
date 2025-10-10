import React, { useState, useEffect, useRef } from 'react'
import { menu_list } from '../../assets/assets'

const ExploreMenu = ({ category, setCategory }) => {
  const scrollContainerRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || isPaused) return

    const scroll = () => {
      if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth) {
        scrollContainer.scrollLeft = 0
      } else {
        scrollContainer.scrollLeft += 1
      }
    }

    const interval = setInterval(scroll, 30)
    return () => clearInterval(interval)
  }, [isPaused])

  const handleCategoryClick = (itemName) => {
    if (category === itemName) {
      // If clicking the already selected item, deselect it
      setCategory('all')
    } else {
      // Select new category
      setCategory(itemName)
    }
  }

  return (
    <div className=' px-4' id="menu">
      <div className='text-center mb-10'>
        <h1 className='text-4xl font-bold text-gray-800 mb-4'>Explore Our Menu</h1>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          Discover our delicious variety of dishes crafted with fresh ingredients
        </p>

        {/* Selected Category Display with Clear Button */}
        {category !== 'all' && (
          <div className='mt-4 flex justify-center items-center space-x-4'>
            <span className='text-lg text-gray-700'>
              Selected: <span className='font-semibold text-red-500'>{category}</span>
            </span>

          </div>
        )}
      </div>

      <div
        className='relative'
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={scrollContainerRef}
          className='px-12 flex space-x-8 overflow-x-hidden py-4 cursor-grab active:cursor-grabbing'
        >
          {menu_list.map((item, index) => (
            <div
              onClick={() => handleCategoryClick(item.menu_name)}
              key={index}
              className={`flex flex-col items-center flex-shrink-0 transform transition-all duration-300 hover:scale-110 cursor-pointer ${category === item.menu_name ? 'scale-110' : ''
                }`}
            >
              <div className={`w-36 h-36 rounded-full border-4 shadow-xl overflow-hidden bg-white transition-all duration-300 ${category === item.menu_name
                ? 'border-red-500 shadow-red-200 ring-4 ring-red-100'
                : 'border-white'
                }`}>
                <img
                  src={item.menu_image}
                  alt={item.menu_name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${category === item.menu_name ? 'scale-110' : 'hover:scale-115'
                    }`}
                />

                {/* Close icon for active item */}
                {category === item.menu_name && (
                  <div className='absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold'>
                    ×
                  </div>
                )}
              </div>
              <p className={`mt-4 text-lg font-semibold transition-colors duration-300 ${category === item.menu_name ? 'text-red-500' : 'text-gray-800'
                }`}>
                {item.menu_name}
              </p>
            </div>
          ))}
        </div>

        {/* Gradient Overlays */}
        <div className='absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent'></div>
        <div className='absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent'></div>
      </div>
    </div >
  )
}

export default ExploreMenu