import { useState, useEffect } from "react";

export interface FavoriteLocation {
  id: string;
  name: string;
  alias?: string;
  lat: number;
  lon: number;
}

const STORAGE_KEY = "weather_favorites";

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
    return true;
  } catch {
    return false;
  }
};

const notify = () => {
  listeners.forEach((l) => l(globalFavorites));
};

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

  const addFavorite = (location: Omit<FavoriteLocation, "id">): boolean => {
    if (globalFavorites.length >= 6) {
      return false;
    }
    const id = `${location.lat}-${location.lon}`;
    if (globalFavorites.some((f) => f.id === id)) return true;
    const newFavorite = { ...location, id };
    const newList = [...globalFavorites, newFavorite];
    setGlobal(newList);
    const ok = persist(newList);
    if (!ok) {
      // revert
      globalFavorites = globalFavorites.filter((f) => f.id !== id);
      notify();
    }
    return ok;
  };

  const removeFavorite = (id: string): boolean => {
    const newList = globalFavorites.filter((f) => f.id !== id);
    setGlobal(newList);
    const ok = persist(newList);
    if (!ok) {
      // try to restore previous state
      setGlobal(globalFavorites);
      return false;
    }
    return true;
  };

  const updateAlias = (id: string, newAlias: string | undefined) => {
    const newList = globalFavorites.map((f) =>
      f.id === id ? { ...f, alias: newAlias } : f,
    );
    setGlobal(newList);
    const ok = persist(newList);
    if (!ok) {
      // try to revert by reloading from storage
      setGlobal(loadFromStorage());
    }
  };

  return { favorites, addFavorite, removeFavorite, updateAlias };
};
