import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;
const url = API_URL;

const StoreContextProvider = (props) => {
  // const [token, setToken] = useState("");
  const [storeToken, setStoreToken] = useState("");
  const [foodList, setFoodList] = useState([]);

  const [currentStore, setCurrentStore] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const savedToken = localStorage.getItem("storeToken");
      if (savedToken) {
        setStoreToken(savedToken);
      }

      const savedStoreToken = localStorage.getItem("storeToken");
      const savedStoreInfo = localStorage.getItem("storeInfo");

      if (savedStoreToken) {
        setStoreToken(savedStoreToken);
      }

      if (savedStoreInfo) {
        setCurrentStore(JSON.parse(savedStoreInfo));
      }
    };

    loadData();
  }, []);

  const contextValue = {
    url,

    storeToken,
    setStoreToken,
    food_list: foodList,
    setFoodList,

    currentStore,
    setCurrentStore,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;