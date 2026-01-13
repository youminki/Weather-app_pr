import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "@shared/api/weather";
import { FavoriteButton } from "@features/manage-favorites/ui/FavoriteButton";
import { Card } from "@shared/ui/Card";
import { cn } from "@shared/lib/utils";
import { WeeklyForecast } from "./WeeklyForecast";
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

const formatPop = (pop: number) => {
  if (pop == null) return "";
  const value = pop > 1 ? Math.round(pop) : Math.round(pop * 100);
  return `${value}%`;
};

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
          <div className="text-left">
            <h3 className="text-white text-2xl font-bold mb-1">
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
              "w-20 h-20 text-white",
              1.5
            )}
            <div>
              <div className="text-6xl font-extrabold text-white">
                {Math.round(current.main.temp)}°
              </div>
              <div className="text-sm text-white/80 mt-1 capitalize">
                {current.weather[0].description}
              </div>
            </div>
          </div>
          <div className="mt-3 text-white/70 text-sm" />
        </div>

        <div className="w-full flex flex-wrap gap-3 justify-start mb-4">
          <div className="px-3 py-2 bg-white/10 text-white rounded-full text-sm">
            미세먼지 좋음
          </div>
          <div className="px-3 py-2 bg-white/10 text-white rounded-full text-sm">
            초미세먼지 좋음
          </div>
          <div className="px-3 py-2 bg-white/10 text-white rounded-full text-sm">
            자외선 좋음
          </div>
          <div className="px-3 py-2 bg-white/10 text-white rounded-full text-sm">
            일출 07:46
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-xs font-semibold">
                체감온도
              </span>
            </div>
            <div className="text-white text-2xl font-bold">
              {Math.round(current.main.feels_like)}°
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-xs font-semibold">습도</span>
            </div>
            <div className="text-white text-2xl font-bold">
              {current.main.humidity}%
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-xs font-semibold">풍속</span>
            </div>
            <div className="text-white text-2xl font-bold">
              {current.wind.speed}m/s
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-xs font-semibold">기압</span>
            </div>
            <div className="text-white text-2xl font-bold">
              {current.main.pressure}
            </div>
          </div>
        </div>
      </Card>

      <Card className="w-full bg-white/90 border border-slate-200/50 shadow-lg">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Sun className="w-5 h-5 text-orange-500" /> 시간별 예보
        </h3>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {forecast.list.slice(0, 12).map((item) => {
            const HourIcon = getWeatherIcon(item.weather[0].icon);
            const hour = new Date(item.dt * 1000).getHours();
            const isNow = hour === new Date().getHours();

            return (
              <div
                key={item.dt}
                className={cn(
                  "flex flex-col items-center gap-2 min-w-20 p-3 rounded-2xl transition-all duration-200",
                  isNow
                    ? "bg-(--primary-50) border-2 border-(--primary-500)"
                    : "bg-white/50 hover:bg-white/60"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isNow ? "text-(--primary-600)" : "text-slate-600"
                  )}
                >
                  {Math.round(item.main.temp)}°
                </span>

                <div
                  className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-full",
                    isNow ? "bg-(--primary-500)/10" : "bg-white"
                  )}
                >
                  <HourIcon
                    className={cn(
                      "w-7 h-7",
                      isNow ? "text-(--primary-500)" : "text-slate-700"
                    )}
                    strokeWidth={1.5}
                  />
                </div>

                {item.pop && item.pop > 0 ? (
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-(--primary-500)" />
                    <span className="text-xs font-semibold text-(--primary-500)">
                      {formatPop(item.pop)}
                    </span>
                  </div>
                ) : (
                  <div className="h-4" />
                )}

                <span className={cn("text-xs text-slate-500")}>
                  {isNow ? "지금" : `${hour}시`}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="w-full">
        <WeeklyForecast daily={forecast.daily} />
      </div>
    </div>
  );
};
