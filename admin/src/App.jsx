import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Order from './pages/Orders/Order'
import { ToastContainer } from 'react-toastify';
import { useState } from 'react'
import StoreLogin from './components/StoreLogin/StoreLogin'
import StoreContextProvider from './context/StoreContext'
import Home from './pages/DashBoard/DashBoard'
import DashBoard from './pages/DashBoard/DashBoard'

const App = () => {
  const [storeLogin, setStoreLogin] = useState(false)

  return (
    <StoreContextProvider>
      <div>
        <ToastContainer />
        <Navbar setStoreLogin={setStoreLogin} />

        {storeLogin ? (
          // Show StoreLogin when storeLogin is true
          <StoreLogin setStoreLogin={setStoreLogin} />
        ) : (
          // Show Admin Dashboard when storeLogin is false
          <div className='app-content flex'>
            
            <div className='flex-1 p-6'>
              <Routes>
                {/* <Route path="/" element={<} /> */}
                <Route path="/add" element={<Add />} />
                <Route path="/store/dashboard" element={<DashBoard></DashBoard>} />
                <Route path="/list" element={<List />} />
                <Route path="/orders" element={<Order />} />
              </Routes>
            </div>
          </div>
        )}
      </div>
    </StoreContextProvider>
  )
}

export default App