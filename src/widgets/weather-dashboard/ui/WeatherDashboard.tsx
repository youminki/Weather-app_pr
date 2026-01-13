import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "@shared/api/weather";
import { FavoriteButton } from "@features/manage-favorites/ui/FavoriteButton";
import { Card } from "@shared/ui/Card";
import { cn } from "@shared/lib/utils";
import { WeeklyForecast } from "./WeeklyForecast";

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

  return (
    <div className="w-full max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Weather White Card */}
      <Card className="flex flex-col items-center p-8 bg-white border border-slate-100 shadow-sm rounded-[2.5rem]">
        {/* Header: Name and Favorite */}
        <div className="w-full flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {locationName || current.name}
          </h2>
          <FavoriteButton
            location={{ lat, lon, name: locationName || current.name }}
          />
        </div>

        {/* Tab-like Visuals (Static for now) */}
        <div className="flex w-full justify-start gap-4 mb-10 border-b border-slate-100 pb-2">
          <button className="text-slate-900 font-semibold border-b-2 border-slate-900 pb-2 -mb-2.5 px-1">
            날씨
          </button>
          <button className="text-slate-400 font-medium hover:text-slate-600 pb-2 transition-colors px-1">
            강수
          </button>
          <button className="text-slate-400 font-medium hover:text-slate-600 pb-2 transition-colors px-1">
            바람
          </button>
          <button className="text-slate-400 font-medium hover:text-slate-600 pb-2 transition-colors px-1">
            습도
          </button>
        </div>

        {/* Hourly Forecast Strip (Graph-like visual) */}
        <div className="w-full mb-12 relative">
          {/* Simple Line Graph Simulation (Background) */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 -z-10 rounded-full" />

          <div className="flex justify-between overflow-x-auto pb-4 scrollbar-hide px-2 gap-4">
            {forecast.list.slice(0, 8).map((item) => (
              <div
                key={item.dt}
                className="flex flex-col items-center gap-3 min-w-[3.5rem] bg-white z-10"
              >
                <span className="text-sm font-bold text-slate-800">
                  {Math.round(item.main.temp)}°
                </span>
                {/* Connecting Dot */}
                <div className="w-3 h-3 rounded-full bg-slate-200 border-2 border-white mb-1" />

                <span className="text-2xl mb-1">
                  {item.weather[0].icon.includes("d") ? "☀️" : "🌙"}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(item.dt * 1000).getHours()}시
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Hour Detail (Main View) */}
        <div className="flex flex-col items-center gap-2 mb-10 w-full py-8 bg-slate-50/50 rounded-3xl">
          <div className="relative">
            <span className="text-6xl filter drop-shadow-sm">
              {current.weather[0].icon.includes("d") ? "☀️" : "🌙"}
            </span>
            <span className="absolute -top-2 -right-12 text-5xl font-bold text-slate-900">
              {Math.round(current.main.temp)}°
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-500 mt-2">
            <span className="text-slate-900 font-medium">어제보다 2.6° ↓</span>
            <span className="text-slate-300 mx-1">/</span>
            <span className="font-medium text-slate-900">
              {current.weather[0].description}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500 mt-2">
            <span>체감 {Math.round(current.main.feels_like)}°</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>습도 {current.main.humidity}%</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>{current.wind.speed}m/s</span>
          </div>
        </div>

        {/* Details Grid (Pills) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          <DetailPill
            label="미세먼지"
            value="좋음"
            color="bg-blue-50 text-blue-600"
          />
          <DetailPill
            label="초미세먼지"
            value="좋음"
            color="bg-blue-50 text-blue-600"
          />
          <DetailPill
            label="자외선"
            value="좋음"
            color="bg-blue-50 text-blue-600"
          />
          <DetailPill
            label="일몰"
            value="17:36"
            color="bg-orange-50 text-orange-600"
          />
        </div>
      </Card>

      {/* Weekly Forecast Section */}
      <WeeklyForecast daily={forecast.daily} />

      {/* Additional Cards */}
      <div className="grid grid-cols-2 gap-4">
        <button className="h-16 flex items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-600 hover:bg-slate-50 font-medium gap-2 transition-all">
          <span>📹 CCTV</span>
        </button>
        <button className="h-16 flex items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-600 hover:bg-slate-50 font-medium gap-2 transition-all">
          <span>🗺️ 날씨 지도</span>
        </button>
      </div>
    </div>
  );
};

const DetailPill = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center py-4 rounded-xl gap-1 transition-colors",
      color
    )}
  >
    <span className="text-xs opacity-70 font-semibold">{label}</span>
    <span className="text-lg font-bold">{value}</span>
  </div>
);
