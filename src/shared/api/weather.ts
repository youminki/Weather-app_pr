import axios from "axios";

const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
const GEO_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

export interface GeoLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface WeatherData {
  coord: { lon: number; lat: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
  dt: number;
  tzone_offset: number;
  name: string;
}

export interface DailyForecast {
  dt: number;
  temp: {
    min: number;
    max: number;
  };
  weather: {
    id: number;
    main: string;
    icon: string;
  }[];
  pop: number;
}

export interface ForecastData {
  list: {
    dt: number;
    main: { temp: number; temp_min: number; temp_max: number };
    weather: { id: number; main: string; icon: string }[];
    pop?: number;
  }[];
  daily: DailyForecast[];
  city: { name: string; coord: { lat: number; lon: number } };
}

const mapWmoCodeToWeather = (code: number, isDay: number = 1) => {
  const suffix = isDay ? "d" : "n";

  switch (code) {
    case 0:
      return { main: "Clear", desc: "맑음", icon: `01${suffix}` };
    case 1:
      return { main: "Clear", desc: "대체로 맑음", icon: `02${suffix}` };
    case 2:
      return { main: "Clouds", desc: "구름 조금", icon: `03${suffix}` };
    case 3:
      return { main: "Clouds", desc: "흐림", icon: `04${suffix}` };
    case 45:
    case 48:
      return { main: "Fog", desc: "안개", icon: `50${suffix}` };
    case 51:
    case 53:
    case 55:
      return { main: "Drizzle", desc: "이슬비", icon: `09${suffix}` };
    case 56:
    case 57:
      return { main: "Drizzle", desc: "어는 비", icon: `09${suffix}` };
    case 61:
    case 63:
    case 65:
      return { main: "Rain", desc: "비", icon: `10${suffix}` };
    case 66:
    case 67:
      return { main: "Rain", desc: "어는 비", icon: `10${suffix}` };
    case 71:
    case 73:
    case 75:
      return { main: "Snow", desc: "눈", icon: `13${suffix}` };
    case 77:
      return { main: "Snow", desc: "진눈깨비", icon: `13${suffix}` };
    case 80:
    case 81:
    case 82:
      return { main: "Rain", desc: "소나기", icon: `09${suffix}` };
    case 85:
    case 86:
      return { main: "Snow", desc: "눈 소나기", icon: `13${suffix}` };
    case 95:
      return { main: "Thunderstorm", desc: "뇌우", icon: `11${suffix}` };
    case 96:
    case 99:
      return {
        main: "Thunderstorm",
        desc: "뇌우 및 우박",
        icon: `11${suffix}`,
      };
    default:
      return { main: "Unknown", desc: "알 수 없음", icon: `03${suffix}` };
  }
};

export const weatherApi = {
  getCurrentWeather: async (lat: number, lon: number): Promise<WeatherData> => {
    try {
      const response = await axios.get(WEATHER_API_URL, {
        params: {
          latitude: lat,
          longitude: lon,
          current:
            "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,is_day,wind_speed_10m,wind_direction_10m",
          daily: "temperature_2m_max,temperature_2m_min",
          timezone: "auto",
        },
      });

      const current = response.data.current;
      const daily = response.data.daily;
      const weatherInfo = mapWmoCodeToWeather(
        current.weather_code,
        current.is_day
      );

      return {
        coord: { lon, lat },
        weather: [
          {
            id: current.weather_code,
            main: weatherInfo.main,
            description: weatherInfo.desc,
            icon: weatherInfo.icon,
          },
        ],
        base: "stations",
        main: {
          temp: current.temperature_2m,
          feels_like: current.apparent_temperature,
          temp_min: daily.temperature_2m_min[0],
          temp_max: daily.temperature_2m_max[0],
          pressure: current.pressure_msl,
          humidity: current.relative_humidity_2m,
        },
        wind: {
          speed: current.wind_speed_10m,
          deg: current.wind_direction_10m,
        },
        dt: new Date(current.time).getTime() / 1000,
        tzone_offset: response.data.utc_offset_seconds,
        name: "Unknown",
      } as WeatherData;
    } catch (error) {
      throw error;
    }
  },

  getForecast: async (lat: number, lon: number): Promise<ForecastData> => {
    try {
      const response = await axios.get(WEATHER_API_URL, {
        params: {
          latitude: lat,
          longitude: lon,
          hourly: "temperature_2m,weather_code,is_day",
          daily:
            "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
          timezone: "auto",
        },
      });

      const hourly = response.data.hourly;
      const daily = response.data.daily;

      const list = hourly.time.map((time: string, index: number) => {
        const weatherInfo = mapWmoCodeToWeather(
          hourly.weather_code[index],
          hourly.is_day[index]
        );
        return {
          dt: new Date(time).getTime() / 1000,
          main: {
            temp: hourly.temperature_2m[index],
            temp_min: hourly.temperature_2m[index],
            temp_max: hourly.temperature_2m[index],
          },
          weather: [
            {
              id: hourly.weather_code[index],
              main: weatherInfo.main,
              icon: weatherInfo.icon,
            },
          ],
        };
      });

      const slicedList = list
        .filter((item: { dt: number }) => item.dt > Date.now() / 1000)
        .slice(0, 24);

      const dailyList = daily.time.map((time: string, index: number) => {
        const weatherInfo = mapWmoCodeToWeather(daily.weather_code[index]);
        return {
          dt: new Date(time).getTime() / 1000,
          temp: {
            min: daily.temperature_2m_min[index],
            max: daily.temperature_2m_max[index],
          },
          weather: [
            {
              id: daily.weather_code[index],
              main: weatherInfo.main,
              icon: weatherInfo.icon,
            },
          ],
          pop: daily.precipitation_probability_max
            ? daily.precipitation_probability_max[index]
            : 0,
        };
      });

      return {
        list: slicedList,
        daily: dailyList,
        city: { name: "Unknown", coord: { lat, lon } },
      };
    } catch (error) {
      throw error;
    }
  },
  getEnvironmental: async (
    lat: number,
    lon: number
  ): Promise<{
    sunrise?: number;
    sunset?: number;
    uvIndex?: number | null;
    pm10?: number | null;
    pm2_5?: number | null;
  }> => {
    try {
      const response = await axios.get(WEATHER_API_URL, {
        params: {
          latitude: lat,
          longitude: lon,
          daily: "sunrise,sunset,uv_index_max",
          hourly: "pm10,pm2_5",
          timezone: "auto",
        },
      });

      const daily = response.data.daily || {};
      const hourly = response.data.hourly || {};

      const nowTs = Date.now() / 1000;

      const sunrise =
        daily.sunrise && daily.sunrise.length > 0
          ? new Date(daily.sunrise[0]).getTime() / 1000
          : undefined;
      const sunset =
        daily.sunset && daily.sunset.length > 0
          ? new Date(daily.sunset[0]).getTime() / 1000
          : undefined;
      const uvIndex =
        daily.uv_index_max && daily.uv_index_max.length > 0
          ? daily.uv_index_max[0]
          : null;

      let pm10: number | null = null;
      let pm2_5: number | null = null;
      if (hourly.time && Array.isArray(hourly.time)) {
        const idx = hourly.time.findIndex(
          (t: string) => new Date(t).getTime() / 1000 >= nowTs
        );
        const useIdx = idx >= 0 ? idx : 0;
        if (hourly.pm10 && hourly.pm10.length > useIdx)
          pm10 = hourly.pm10[useIdx];
        if (hourly.pm2_5 && hourly.pm2_5.length > useIdx)
          pm2_5 = hourly.pm2_5[useIdx];
      }

      return { sunrise, sunset, uvIndex, pm10, pm2_5 };
    } catch (_) {
      return { uvIndex: null, pm10: null, pm2_5: null };
    }
  },
};

export const getGeoLocation = async (
  query: string
): Promise<GeoLocation | null> => {
  try {
    const response = await axios.get(GEO_API_URL, {
      params: {
        name: query,
        count: 1,
        language: "ko",
        format: "json",
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        name: result.name,
        lat: result.latitude,
        lon: result.longitude,
        country: result.country_code,
        state: result.admin1,
      };
    }
    return null;
  } catch (_) {
    return null;
  }
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const searchNominatim = async (query: string): Promise<GeoLocation | null> => {
  try {
    const response = await axios.get(NOMINATIM_URL, {
      params: {
        q: query,
        format: "jsonv2",
        limit: 1,
        addressdetails: 1,
        "accept-language": "ko",
      },
    });

    if (response.data && response.data.length > 0) {
      const r = response.data[0];
      return {
        name: r.display_name || r.name || query,
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
        country: r.address?.country_code?.toUpperCase() || "",
        state: r.address?.state || r.address?.county || undefined,
      };
    }
    return null;
  } catch (_) {
    return null;
  }
};

export const getGeoLocationWithFallback = async (
  query: string
): Promise<GeoLocation | null> => {
  const primary = await getGeoLocation(query);
  if (primary) return primary;
  return await searchNominatim(query);
};
