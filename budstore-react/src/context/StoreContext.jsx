import { createContext, useContext, useState, useEffect } from "react";

const StoreContext = createContext(null);

const STORAGE_KEY = "budstore_selected_store";

export function StoreProvider({ children }) {
  const [selectedStore, setSelectedStore] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      const store = JSON.parse(saved);
      // Ensure the API client has the store ID on initial load.
      if (store?.internalId) {
        localStorage.setItem("budstore_current_store_id", String(store.internalId));
      }
      return store;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (selectedStore) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedStore));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedStore]);

  const selectStore = (store) => {
    setSelectedStore(store);
    // Persist the internal Drupal store ID for the API client
    // (Commerce-Current-Store header).
    if (store?.internalId) {
      localStorage.setItem("budstore_current_store_id", String(store.internalId));
    }
  };

  const clearStore = () => {
    setSelectedStore(null);
    localStorage.removeItem("budstore_current_store_id");
  };

  return (
    <StoreContext.Provider value={{ selectedStore, selectStore, clearStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContext() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    return { selectedStore: null, selectStore: () => {}, clearStore: () => {} };
  }
  return ctx;
}
