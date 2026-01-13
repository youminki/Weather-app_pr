import { WeatherData } from "@shared/api/weather";
import { Card } from "@shared/ui/Card";

interface WeatherCardProps {
  data: WeatherData;
}

export const WeatherCard = ({ data }: WeatherCardProps) => {
  const { main, weather } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <Card className="flex flex-col items-center justify-center p-6 sm:p-8 text-center md:col-span-2 bg-gradient-to-br from-[color:var(--primary-600)] to-[color:var(--primary-500)] text-white">
        <div className="text-4xl sm:text-6xl mb-2">
          {weather[0].icon === "01d" ? "☀️" : "☁️"}
        </div>
        <h2 className="text-4xl sm:text-6xl font-bold mb-2">
          {Math.round(main.temp)}°
        </h2>
        <p className="text-2xl text-white/80 capitalize w-full sm:max-w-[28rem] truncate">
          {weather[0].description}
        </p>
        <div className="flex gap-4 mt-4 text-white/60">
          <span>H: {Math.round(main.temp_max)}°</span>
          <span>L: {Math.round(main.temp_min)}°</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-sm text-blue-100 mb-1">체감 온도</div>
            <div className="text-lg sm:text-xl font-semibold">
              {Math.round(main.feels_like)}°
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-sm text-blue-100 mb-1">습도</div>
            <div className="text-lg sm:text-xl font-semibold">
              {main.humidity}%
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-sm text-blue-100 mb-1">최저 기온</div>
            <div className="text-lg sm:text-xl font-semibold">
              {Math.round(main.temp_min)}°
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-sm text-blue-100 mb-1">최고 기온</div>
            <div className="text-lg sm:text-xl font-semibold">
              {Math.round(main.temp_max)}°
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
