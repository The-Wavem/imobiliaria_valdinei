import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { logAddToWishlistAnalytics } from "@services/analyticsService.js";
import { incrementPropertyFavorite } from "@services/propertyService.js";
import styles from "./Button_Favorito.module.css";

const STORAGE_KEY = "imobiliaria-valdinei:favorites";

function readFavorites() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedFavorites = window.localStorage.getItem(STORAGE_KEY);

    if (!storedFavorites) {
      return [];
    }

    const parsedFavorites = JSON.parse(storedFavorites);
    return Array.isArray(parsedFavorites) ? parsedFavorites : [];
  } catch {
    return [];
  }
}

function writeFavorites(favorites) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export default function ButtonFavorito({ property }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(readFavorites().some((favorite) => favorite.id === property.id));
  }, [property.id]);

  function handleToggleFavorite() {
    const favorites = readFavorites();
    const alreadyFavorite = favorites.some((favorite) => favorite.id === property.id);

    const nextFavorites = alreadyFavorite
      ? favorites.filter((favorite) => favorite.id !== property.id)
      : [...favorites, property];

    writeFavorites(nextFavorites);
    setIsFavorite(!alreadyFavorite);

    if (!alreadyFavorite) {
      logAddToWishlistAnalytics(property);
    }

    // Atualiza o ranking global silenciosamente
    try {
      const propertyId = property.firestoreId || property.id;
      if (propertyId) {
        incrementPropertyFavorite(propertyId, alreadyFavorite ? -1 : 1);
      }
    } catch (e) {
      // Falha silenciosa para não quebrar UI
    }
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${isFavorite ? styles.buttonActive : ""}`.trim()}
      aria-label={isFavorite ? "Remover dos favoritos" : "Favoritar imóvel"}
      aria-pressed={isFavorite}
      onClick={handleToggleFavorite}
    >
      <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
}