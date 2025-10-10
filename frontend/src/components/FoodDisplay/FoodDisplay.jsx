import React from 'react'
import { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext)

  // Filter food items based on category
  const filteredFoodList = category === 'all'
    ? food_list
    : food_list.filter(item => item.category === category)

  return (
    <div className='food-display mt-8 px-4 max-w-7xl mx-auto' id="explore-menu">
      <h2 className='text-4xl font-bold text-gray-800 mb-4 text-center'>
        {category === 'all' ? 'Our Delicious Menu' : category}
      </h2>
      <p className='text-gray-500 text-center mb-8 text-lg'>
        {category === 'all'
          ? 'Discover all our mouth-watering dishes'
          : `Explore our delicious ${category.toLowerCase()} selection`
        }
        <span className='block text-red-500 font-semibold mt-2'>
          {filteredFoodList.length} {filteredFoodList.length === 1 ? 'item' : 'items'} found
        </span>
      </p>

      {
        filteredFoodList.length === 0 ? (
          <div className='text-center py-16 bg-gray-50 rounded-2xl'>
            <div className='text-6xl mb-4'>🍕</div>
            <p className='text-gray-500 text-xl'>No dishes found in this category.</p>
            <p className='text-gray-400 mt-2'>Try selecting a different category</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
            {filteredFoodList.map((item) => (
              <FoodItem
                key={item._id}
                id={item._id}
                name={item.name}
                price={item.price}
                description={item.description}
                image={item.image}
                category={item.category}
              />
            ))}
          </div>
        )
      }
    </div >
  )
}

export default FoodDisplay