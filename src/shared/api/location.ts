import axios from "axios";

let koreaDistricts: string[] | null = null;
const loadKoreaDistricts = async (): Promise<string[]> => {
  if (koreaDistricts) return koreaDistricts;
  try {
    const res = await fetch(
      `${import.meta.env.BASE_URL || "/"}korea_districts.json`
    );
    if (!res.ok) {
      koreaDistricts = [];
      return koreaDistricts;
    }
    koreaDistricts = (await res.json()) as string[];
    return koreaDistricts || [];
  } catch {
    koreaDistricts = [];
    return koreaDistricts;
  }
};

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
  const districts = await loadKoreaDistricts();

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[,-]+/g, " ").replace(/\s+/g, " ").trim();

  const matchDistrict = (district: string, qstr: string) => {
    const d = normalize(district);
    const qn = normalize(qstr);
    if (d.includes(qn)) return true;
    const qTokens = qn.split(" ").filter(Boolean);

    return qTokens.every((t) => d.includes(t));
  };

  if (!q || q.length < 1) return [];
  const results = (districts || [])
    .filter((d) => matchDistrict(d, q))
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

  const districts = await loadKoreaDistricts();
  const filtered = (districts || [])
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
    const response = await axios.get<GeocodingApiResponse>(GEOCODING_API_URL, {
      params: {
        name: query,
        count: 10,
        language: "ko",
        format: "json",
      },
    });
    if (!response.data.results || response.data.results.length === 0) {
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
  } catch {
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
    candidates.add(parts.slice(-2).join(" "));
    candidates.add(parts[parts.length - 1]);
  }

  const insertSuffixSpaces = (s: string) =>
    s
      .replace(/(시|군|구|도|동|읍|면)/g, "$1 ")
      .replace(/\s+/g, " ")
      .trim();

  candidates.add(insertSuffixSpaces(district));

  for (const q of Array.from(candidates)) {
    try {
      const apiResults = await searchGeocodingApi(q);
      if (apiResults.length > 0) {
        const normalize = (s: string) =>
          (s || "").toLowerCase().replace(/\s+/g, " ").trim();
        const districtTokens = district
          .replace(/-/g, " ")
          .split(/\s+/)
          .map((t) => normalize(t))
          .filter(Boolean);

        let best = apiResults[0];
        let bestScore = -1;
        for (const r of apiResults) {
          let score = 0;
          const a1 = normalize(r.admin1 || "");
          const a2 = normalize(r.admin2 || "");
          const name = normalize(r.name || "");
          for (const t of districtTokens) {
            if (a1 && a1.includes(t)) score += 3;
            if (a2 && a2.includes(t)) score += 2;
            if (name && name.includes(t)) score += 1;
          }
          if (score > bestScore) {
            bestScore = score;
            best = r;
          }
        }

        geocodeCache.set(district, best);
        return { lat: best.latitude, lon: best.longitude };
      }
    } catch {
      void 0;
    }
  }

  return null;
};

export const searchLocations = async (query: string): Promise<Location[]> => {
  if (!query || query.length < 2) {
    return [];
  }

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
