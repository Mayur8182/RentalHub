import { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'rh_favorites';

const FavoritesContext = createContext();

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const save = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // quota exceeded — silent fail
  }
};

export function FavoritesProvider({ children }) {
  // Each entry is the full vehicle object so we can render the list without
  // an extra API call.
  const [favorites, setFavorites] = useState(load);

  const isFavorite = useCallback(
    (vehicleId) => favorites.some((v) => v._id === vehicleId),
    [favorites]
  );

  const addFavorite = useCallback((vehicle) => {
    setFavorites((prev) => {
      if (prev.some((v) => v._id === vehicle._id)) return prev;
      const next = [...prev, vehicle];
      save(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((vehicleId) => {
    setFavorites((prev) => {
      const next = prev.filter((v) => v._id !== vehicleId);
      save(next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback(
    (vehicle) => {
      if (isFavorite(vehicle._id)) {
        removeFavorite(vehicle._id);
      } else {
        addFavorite(vehicle);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite, clearFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}

export default FavoritesContext;
