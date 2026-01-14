import { useState, useEffect } from "react";
import { queryClient } from "@shared/api/queryClient";
import { weatherApi } from "@shared/api/weather";

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
  } catch {
    void 0;
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

  useEffect(() => {
    if (favorites.length === 0) return;
    void (async () => {
      try {
        const points = favorites.map((f) => ({
          id: f.id,
          lat: f.lat,
          lon: f.lon,
        }));
        const summaries = await weatherApi.getCurrentWeatherBatch(points, 6);
        const ids = favorites.map((f) => f.id);
        queryClient.setQueryData(["favorites-weather", ids], summaries);
        for (const f of favorites) {
          const s = summaries[f.id];
          if (!s) continue;
          queryClient.setQueryData(["weather", f.lat, f.lon], {
            main: {
              temp: s.temp,
              temp_min: s.temp_min,
              temp_max: s.temp_max,
              feels_like: s.temp,
            },
            weather: [{ icon: s.icon, description: s.description }],
            coord: { lat: s.lat, lon: s.lon },
            name: f.name,
          });
        }
      } catch {
        // ignore
      }
    })();
  }, [favorites]);

  const setGlobal = (favs: FavoriteLocation[]) => {
    globalFavorites = favs;
    persist(globalFavorites);
    notify();

    void (async () => {
      try {
        if (globalFavorites.length === 0) return;
        const points = globalFavorites.map((f) => ({
          id: f.id,
          lat: f.lat,
          lon: f.lon,
        }));
        const summaries = await weatherApi.getCurrentWeatherBatch(points, 6);
        const ids = globalFavorites.map((f) => f.id);
        queryClient.setQueryData(["favorites-weather", ids], summaries);

        for (const f of globalFavorites) {
          const s = summaries[f.id];
          if (!s) continue;
          queryClient.setQueryData(["weather", f.lat, f.lon], {
            main: {
              temp: s.temp,
              temp_min: s.temp_min,
              temp_max: s.temp_max,
              feels_like: s.temp,
            },
            weather: [{ icon: s.icon, description: s.description }],
            coord: { lat: s.lat, lon: s.lon },
            name: f.name,
          });
        }
      } catch {
        // ignore prefetch errors
      }
    })();
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
