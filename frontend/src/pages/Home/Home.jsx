import React, { useState } from 'react'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import AppDownload from '../../components/AddDownload/AppDownload';
import StoreList from '../../components/StoreList/StoreList';

const Home = () => {

  const [category, setCategory] = useState("all");

  return (
    <div>
      <Header></Header>
      <ExploreMenu category={category} setCategory={setCategory}></ExploreMenu>
      {/* <FoodDisplay category={category}></FoodDisplay> */}
      <StoreList ></StoreList>
      <AppDownload></AppDownload>
    </div>
  )
}

export default Home
