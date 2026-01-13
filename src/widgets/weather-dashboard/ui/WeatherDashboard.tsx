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
  CloudDrizzle
} from "lucide-react";

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
        <div className="text-white/60 animate-pulse text-lg font-medium">
          날씨 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  if (!current || !forecast)
    return (
      <div className="w-full text-center p-8 text-red-300 bg-red-500/10 rounded-3xl border border-red-500/20">
        날씨 정보를 불러오는데 실패했습니다.
      </div>
    );

  const getWeatherIcon = (iconCode: string) => {
    const code = iconCode.slice(0, 2);
    const isDay = iconCode.includes('d');
    
    switch(code) {
      case '01': return isDay ? Sun : Moon;
      case '02': return Cloud;
      case '03': case '04': return Cloud;
      case '09': return CloudDrizzle;
      case '10': return CloudRain;
      case '11': return CloudRain;
      case '13': return CloudSnow;
      default: return Cloud;
    }
  };

  const renderWeatherIcon = (iconCode: string, className: string, strokeWidth: number) => {
    const IconComponent = getWeatherIcon(iconCode);
    return React.createElement(IconComponent, { className, strokeWidth });
  };

  return (
    <div className="w-full max-w-5xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 메인 날씨 카드 */}
      <Card className="overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-0 shadow-2xl shadow-blue-500/30">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-2xl font-bold mb-1">
              {locationName || current.name}
            </h2>
            <p className="text-blue-100 text-sm font-medium">
              {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
            </p>
          </div>
          <FavoriteButton
            location={{ lat, lon, name: locationName || current.name }}
          />
        </div>

        {/* 현재 날씨 메인 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            {renderWeatherIcon(current.weather[0].icon, "w-24 h-24 text-white", 1.5)}
            <div>
              <div className="text-7xl font-bold text-white mb-2">
                {Math.round(current.main.temp)}°
              </div>
              <p className="text-blue-100 text-lg font-medium capitalize">
                {current.weather[0].description}
              </p>
            </div>
          </div>
        </div>

        {/* 상세 정보 그리드 */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-200" />
              <span className="text-blue-100 text-xs font-semibold">체감온도</span>
            </div>
            <div className="text-white text-2xl font-bold">
              {Math.round(current.main.feels_like)}°
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-200" />
              <span className="text-blue-100 text-xs font-semibold">습도</span>
            </div>
            <div className="text-white text-2xl font-bold">
              {current.main.humidity}%
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-blue-200" />
              <span className="text-blue-100 text-xs font-semibold">풍속</span>
            </div>
            <div className="text-white text-2xl font-bold">
              {current.wind.speed}m/s
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-blue-200" />
              <span className="text-blue-100 text-xs font-semibold">기압</span>
            </div>
            <div className="text-white text-2xl font-bold">
              {current.main.pressure}
            </div>
          </div>
        </div>
      </Card>

      {/* 시간별 예보 카드 */}
      <Card className="bg-white/90 border border-slate-200/50 shadow-lg">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Sun className="w-5 h-5 text-orange-500" />
          시간별 예보
        </h3>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          {forecast.list.slice(0, 12).map((item) => {
            const HourIcon = getWeatherIcon(item.weather[0].icon);
            const hour = new Date(item.dt * 1000).getHours();
            const isNow = hour === new Date().getHours();
            
            return (
              <div
                key={item.dt}
                className={cn(
                  "flex flex-col items-center gap-3 min-w-[80px] p-4 rounded-2xl transition-all duration-200",
                  isNow 
                    ? "bg-blue-50 border-2 border-blue-500" 
                    : "bg-slate-50/50 hover:bg-slate-100/80"
                )}
              >
                <span className={cn(
                  "text-sm font-bold",
                  isNow ? "text-blue-600" : "text-slate-500"
                )}>
                  {isNow ? '지금' : `${hour}시`}
                </span>
                
                <HourIcon 
                  className={cn(
                    "w-8 h-8",
                    isNow ? "text-blue-500" : "text-slate-700"
                  )} 
                  strokeWidth={1.5}
                />
                
                {item.pop && item.pop > 0 && (
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span className="text-xs font-semibold text-blue-600">
                      {Math.round(item.pop * 100)}%
                    </span>
                  </div>
                )}
                
                <span className="text-lg font-bold text-slate-900">
                  {Math.round(item.main.temp)}°
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 주간 예보 */}
      <WeeklyForecast daily={forecast.daily} />
    </div>
  );
};


