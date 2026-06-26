import { useState, useEffect } from "react";
import { logAddToWishlistAnalytics } from "@services/analyticsService.js";
import { incrementPropertyFavorite } from "@services/propertyService.js";

const STORAGE_KEY = "@wavem-valdinei:favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.warn("Error reading localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.type === "favorites_updated") {
        setFavorites(e.detail);
      } else if (e.key === STORAGE_KEY) {
        setFavorites(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    window.addEventListener("favorites_updated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("favorites_updated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggleFavorite = (property) => {
    const isFav = favorites.some((fav) => fav.id === property.id);
    let newFavorites;

    if (isFav) {
      newFavorites = favorites.filter((fav) => fav.id !== property.id);
    } else {
      newFavorites = [...favorites, property];
      try {
        logAddToWishlistAnalytics(property);
      } catch (e) {
        console.error("Analytics Error", e);
      }
    }

    // Atualiza o ranking global silenciosamente
    try {
      const propertyId = property.firestoreId || property.id;
      if (propertyId) {
        incrementPropertyFavorite(propertyId, isFav ? -1 : 1);
      }
    } catch (e) {
      console.error("Erro ao incrementar favorito no BD", e);
    }

    setFavorites(newFavorites);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
    
    window.dispatchEvent(
      new CustomEvent("favorites_updated", { detail: newFavorites })
    );
  };

  const isFavorite = (propertyId) => {
    return favorites.some((fav) => fav.id === propertyId);
  };

  return { favorites, toggleFavorite, isFavorite };
}
