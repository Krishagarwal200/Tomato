import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const url = "http://localhost:4000";

const StoreContextProvider = (props) => {
  const [token, setToken] = useState("");
  const [storeToken, setStoreToken] = useState("");
  const [foodList, setFoodList] = useState([]);

  const [currentStore, setCurrentStore] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
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
    token,
    setToken,
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