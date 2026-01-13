import axios from "axios";
import koreaDistricts from "@shared/assets/korea_districts.json";

const koreaDistrictsIndex: Record<string, string[]> = {};

const localDistrictCoords: Record<
  string,
  { lat: number; lon: number; name?: string }
> = {};

export interface Location {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  admin2?: string;
  source?: "local" | "api";
}

export type District = string;

export const searchDistricts = async (query: string): Promise<District[]> => {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();

  if (koreaDistrictsIndex && Object.keys(koreaDistrictsIndex).length > 0) {
    const tokens = q.replace(/[-,]/g, " ").split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];

    const lists: string[][] = tokens.map((t) => koreaDistrictsIndex[t] || []);

    lists.sort((a, b) => a.length - b.length);
    let resultSet: Set<string> = new Set(lists[0] || []);
    for (let i = 1; i < lists.length; i++) {
      const s = new Set<string>(lists[i]);
      resultSet = new Set<string>(
        Array.from(resultSet).filter((x) => s.has(x))
      );
      if (resultSet.size === 0) break;
    }

    let results: string[] = Array.from(resultSet);

    if (results.length === 0) {
      const union: Set<string> = new Set<string>();
      for (const l of lists) l.forEach((x) => union.add(x));
      results = Array.from(union);
    }

    results.sort((a, b) => {
      const ai = a.toLowerCase().indexOf(q);
      const bi = b.toLowerCase().indexOf(q);
      return (ai === -1 ? 9999 : ai) - (bi === -1 ? 9999 : bi);
    });

    return results.slice(0, 10);
  }

  if (!query || query.length < 2) return [];
  const normalized = q;
  const results = (koreaDistricts as string[])
    .filter((d) => {
      const lower = d.toLowerCase();
      return lower.includes(normalized) || d.includes(query);
    })
    .slice(0, 10);
  return results;
};

interface GeocodingApiResponse {
  results?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
    admin2?: string;
  }[];
}

const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

const geocodeCache = new Map<string, Location>();

async function searchKoreaDistrictsWithGeocoding(
  query: string
): Promise<Location[]> {
  const normalizedQuery = query.toLowerCase().trim();
  const results: Location[] = [];
  const seen = new Set<string>();

  const filtered = koreaDistricts
    .filter((district: string) => {
      const lower = district.toLowerCase();
      return lower.includes(normalizedQuery) || district.includes(query);
    })
    .slice(0, 10);

  for (const district of filtered) {
    if (geocodeCache.has(district)) {
      const cached = geocodeCache.get(district)!;
      if (!seen.has(cached.name)) {
        seen.add(cached.name);
        results.push(cached);
      }
      continue;
    }
    try {
      const apiResults = await searchGeocodingApi(district);
      if (apiResults.length > 0) {
        const loc = apiResults[0];
        geocodeCache.set(district, loc);
        if (!seen.has(loc.name)) {
          seen.add(loc.name);
          results.push(loc);
        }
      }
    } catch {
      void 0;
    }
  }
  return results;
}

async function searchGeocodingApi(query: string): Promise<Location[]> {
  try {
    console.log("[Geocoding API] Query:", query);
    const response = await axios.get<GeocodingApiResponse>(GEOCODING_API_URL, {
      params: {
        name: query,
        count: 10,
        language: "ko",
        format: "json",
      },
    });

    console.log("[Geocoding API] Response:", response.data);

    if (!response.data.results || response.data.results.length === 0) {
      console.log("[Geocoding API] No results found");
      return [];
    }

    return response.data.results.map((item) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country,
      admin1: item.admin1,
      admin2: item.admin2,
      source: "api",
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[Geocoding API] Error:", error.message);
    } else {
      console.error("[Geocoding API] Unexpected error:", error);
    }
    return [];
  }
}

export const getCoordsForDistrict = async (
  district: string
): Promise<{ lat: number; lon: number } | null> => {
  if (!district) return null;

  if (localDistrictCoords && localDistrictCoords[district]) {
    const v = localDistrictCoords[district];
    return { lat: v.lat, lon: v.lon };
  }

  if (geocodeCache.has(district)) {
    const cached = geocodeCache.get(district)!;
    return { lat: cached.latitude, lon: cached.longitude };
  }

  const candidates = new Set<string>();
  candidates.add(district);
  candidates.add(district.replace(/-/g, " "));

  const parts = district
    .split("-")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length > 1) {
    const reversed = parts.slice().reverse().join(", ");
    candidates.add(reversed);
    candidates.add(parts.slice().reverse().join(" "));
  }

  for (const q of Array.from(candidates)) {
    try {
      console.log("[Geocoding API] Try query:", q);
      const apiResults = await searchGeocodingApi(q);
      if (apiResults.length > 0) {
        const loc = apiResults[0];
        geocodeCache.set(district, loc);
        return { lat: loc.latitude, lon: loc.longitude };
      }
    } catch {
      console.error("[getCoordsForDistrict] error for", q);
    }
  }

  return null;
};

export const searchLocations = async (query: string): Promise<Location[]> => {
  if (!query || query.length < 2) {
    console.log("[Search] Query too short:", query);
    return [];
  }

  console.log("[Search] Starting search for:", query);

  const hasKorean = /[\u3131-\u314e|\u314f-\u3163|\uac00-\ud7a3]/.test(query);

  let results: Location[] = [];

  if (hasKorean) {
    results = await searchKoreaDistrictsWithGeocoding(query);
    if (results.length === 0) {
      const apiResults = await searchGeocodingApi(query);
      results = apiResults;
    }
  } else {
    results = await searchGeocodingApi(query);
  }

  const uniqueResults = results.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.name === item.name &&
          Math.abs(t.latitude - item.latitude) < 0.01 &&
          Math.abs(t.longitude - item.longitude) < 0.01
      )
  );

  return uniqueResults.slice(0, 10);
};
