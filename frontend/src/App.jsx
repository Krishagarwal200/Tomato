import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Verify from './pages/Verify/Verify'
import MyOrders from './pages/MyOrders/MyOrders'
import AddStore from './components/AddStore/AddStore'
import StoreDetails from './components/StoreDetails/StoreDetails'
import StoreList from './components/StoreList/StoreList'

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [addStore, setaddStore] = useState(false);

  return (
    <>
      <div className='App'>
        {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
        {addStore && <AddStore setaddStore={setaddStore} />}
        <Navbar setShowLogin={setShowLogin} setaddStore={setaddStore} />

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/myorders' element={<MyOrders />} />
          <Route path='/stores' element={<StoreList />} />
          <Route path='/store/:storeId' element={<StoreDetails />} /> {/* Updated route */}
        </Routes>
        <Footer />
      </div>
    </>
  )
}

export default App