import { useState, useEffect } from "react";

export interface FavoriteLocation {
  id: string;
  name: string;
  alias?: string;
  lat: number;
  lon: number;
}

const STORAGE_KEY = "weather_favorites";

// Module-level store so multiple components share state immediately
let globalFavorites: FavoriteLocation[] = [];
const listeners = new Set<(f: FavoriteLocation[]) => void>();

const loadFromStorage = (): FavoriteLocation[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    void 0;
    return [];
  }
};

const persist = (favs: FavoriteLocation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch {
    void 0;
  }
};

const notify = () => {
  listeners.forEach((l) => l(globalFavorites));
};

// initialize once
if (globalFavorites.length === 0) {
  globalFavorites = loadFromStorage();
}

export const useFavorites = () => {
  const [favorites, setFavorites] =
    useState<FavoriteLocation[]>(globalFavorites);

  useEffect(() => {
    const cb = (f: FavoriteLocation[]) => setFavorites(f);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const setGlobal = (favs: FavoriteLocation[]) => {
    globalFavorites = favs;
    persist(globalFavorites);
    notify();
  };

  const addFavorite = (location: Omit<FavoriteLocation, "id">) => {
    if (globalFavorites.length >= 6) {
      alert("Maximum 6 favorites allowed");
      return;
    }
    const id = `${location.lat}-${location.lon}`;
    if (globalFavorites.some((f) => f.id === id)) return;
    const newFavorite = { ...location, id };
    setGlobal([...globalFavorites, newFavorite]);
  };

  const removeFavorite = (id: string) => {
    setGlobal(globalFavorites.filter((f) => f.id !== id));
  };

  const updateAlias = (id: string, newAlias: string | undefined) => {
    setGlobal(
      globalFavorites.map((f) => (f.id === id ? { ...f, alias: newAlias } : f))
    );
  };

  return { favorites, addFavorite, removeFavorite, updateAlias };
};
