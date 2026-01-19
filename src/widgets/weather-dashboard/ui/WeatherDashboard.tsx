import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "@shared/api/weather";
import { FavoriteButton } from "@features/manage-favorites/ui/FavoriteButton";
import { Card } from "@shared/ui";
import { WeeklyForecast } from "./WeeklyForecast";
import { HourlyForecastGraph } from "./HourlyForecastGraph";
import React from "react";
import {
  Droplets,
  Wind,
  Gauge,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
} from "lucide-react";

const getWeatherIcon = (iconCode: string) => {
  const code = iconCode.slice(0, 2);
  const isDay = iconCode.includes("d");
  switch (code) {
    case "01":
      return isDay ? Sun : Moon;
    case "02":
      return Cloud;
    case "03":
    case "04":
      return Cloud;
    case "09":
      return CloudDrizzle;
    case "10":
      return CloudRain;
    case "11":
      return CloudRain;
    case "13":
      return CloudSnow;
    default:
      return Cloud;
  }
};

const renderWeatherIcon = (
  iconCode: string,
  className: string,
  strokeWidth = 1.5
) => {
  const Icon = getWeatherIcon(iconCode);
  return React.createElement(Icon, { className, strokeWidth });
};

interface WeatherDashboardProps {
  lat: number;
  lon: number;
  locationName?: string;
}

export const WeatherDashboard = ({
  lat,
  lon,
  locationName,
}: WeatherDashboardProps) => {
  const { data: current, isLoading: isCurrentLoading } = useQuery({
    queryKey: ["weather", lat, lon],
    queryFn: () => weatherApi.getCurrentWeather(lat, lon),
  });

  const { data: forecast, isLoading: isForecastLoading } = useQuery({
    queryKey: ["forecast", lat, lon],
    queryFn: () => weatherApi.getForecast(lat, lon),
  });

  if (isCurrentLoading || isForecastLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-muted animate-pulse text-lg font-medium">
          날씨 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  if (!current || !forecast) {
    return (
      <div className="w-full text-center p-8 text-red-300 bg-red-500/10 rounded-3xl border border-red-500/20">
        날씨 정보를 불러오는데 실패했습니다.
      </div>
    );
  }

  return (
    <div className="w-full max-w-175 mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">
      <Card className="overflow-hidden bg-linear-to-br from-(--primary-600) to-(--primary-500) border-0 shadow-2xl shadow-(color:--primary-500)/30">
        <div className="flex items-start justify-between mb-4">
          <div className="text-left w-full">
            <h3 className="text-white text-2xl font-bold mb-1 w-full sm:max-w-[60%] truncate">
              {locationName || current.name}
            </h3>
            <p className="text-white/70 text-sm">
              {new Date().toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </p>
          </div>
          <div>
            <FavoriteButton
              location={{ lat, lon, name: locationName || current.name }}
            />
          </div>
        </div>

        <div className="w-full text-center mb-4">
          <div className="flex items-center justify-center gap-4">
            {renderWeatherIcon(
              current.weather[0].icon,
              "w-16 h-16 sm:w-20 sm:h-20 text-white",
              1.5
            )}
            <div>
              <div className="text-4xl sm:text-6xl font-extrabold text-white">
                {Math.round(current.main.temp)}°
              </div>
              <div className="text-sm text-white/80 mt-1 capitalize w-full sm:max-w-[18rem] truncate">
                {current.weather[0].description}
              </div>
            </div>
          </div>
          <div className="mt-3 text-white/70 text-sm" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-xs font-semibold">
                체감온도
              </span>
            </div>
            <div className="text-white text-xl sm:text-2xl font-bold">
              {Math.round(current.main.feels_like)}°
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-xs font-semibold">습도</span>
            </div>
            <div className="text-white text-xl sm:text-2xl font-bold">
              {current.main.humidity}%
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-xs font-semibold">풍속</span>
            </div>
            <div className="text-white text-xl sm:text-2xl font-bold">
              {current.wind.speed}m/s
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-xs font-semibold">기압</span>
            </div>
            <div className="text-white text-xl sm:text-2xl font-bold">
              {current.main.pressure}
            </div>
          </div>
        </div>
      </Card>

      <Card className="w-full bg-white/90 border border-slate-200/50 shadow-lg">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 p-6 pb-0">
          <Sun className="w-5 h-5 text-orange-500" /> 시간별 예보
        </h3>

        <div className="pb-4">
          <HourlyForecastGraph items={forecast.list} />
        </div>
      </Card>

      <div className="w-full">
        <WeeklyForecast daily={forecast.daily} />
      </div>
    </div>
  );
};
