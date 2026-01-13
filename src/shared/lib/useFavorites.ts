import { useState, useEffect } from "react";

export interface FavoriteLocation {
  id: string;
  name: string;
  alias?: string;
  lat: number;
  lon: number;
}

const STORAGE_KEY = "weather_favorites";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (location: Omit<FavoriteLocation, "id">) => {
    if (favorites.length >= 6) {
      alert("Maximum 6 favorites allowed");
      return;
    }
    const id = `${location.lat}-${location.lon}`;
    if (favorites.some((f) => f.id === id)) return;

    const newFavorite = { ...location, id };
    setFavorites([...favorites, newFavorite]);
  };

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter((f) => f.id !== id));
  };

  const updateAlias = (id: string, newAlias: string | undefined) => {
    setFavorites(
      favorites.map((f) => (f.id === id ? { ...f, alias: newAlias } : f))
    );
  };

  return { favorites, addFavorite, removeFavorite, updateAlias };
};
