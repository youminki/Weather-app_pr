import React from "react";
import { DailyForecast } from "@shared/api/weather";
import { Card } from "@shared/ui/Card";
import { cn } from "@shared/lib/utils";
import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  Droplets,
} from "lucide-react";

interface WeeklyForecastProps {
  daily: DailyForecast[];
}

export const WeeklyForecast = ({ daily }: WeeklyForecastProps) => {
  const formatDay = (dt: number, index: number) => {
    const date = new Date(dt * 1000);
    const day = date.getDate();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const dayName =
      index === 0 ? "오늘" : index === 1 ? "내일" : days[date.getDay()];
    return { day, dayName, fullDate: `${date.getMonth() + 1}.${day}` };
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

  return (
    <Card className="bg-white/90 border border-slate-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">주간 예보</h3>
        <span className="text-sm text-slate-500 font-medium">7일간</span>
      </div>
      <div className="space-y-3">
        {daily.map((item, index) => {
          const { dayName, fullDate } = formatDay(item.dt, index);
          const date = new Date(item.dt * 1000);
          const dayOfWeek = date.getDay();
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;

          return (
            <div
              key={item.dt}
              className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-100/80 transition-all duration-200"
            >
              {/* 요일 */}
              <div className="w-20">
                <span
                  className={cn(
                    "text-base font-bold",
                    isSunday
                      ? "text-red-500"
                      : isSaturday
                      ? "text-blue-500"
                      : "text-slate-900"
                  )}
                >
                  {dayName}
                </span>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {fullDate}
                </p>
              </div>

              {/* 아이콘과 강수확률 */}
              <div className="flex items-center gap-3 flex-1 justify-center">
                {React.createElement(getWeatherIcon(item.weather[0].icon), {
                  className: "w-8 h-8 text-slate-700",
                  strokeWidth: 1.5,
                })}

                {item.pop > 0 && (
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm font-bold text-blue-600">
                      {Math.round(item.pop * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* 온도 범위 */}
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-sm font-medium w-12 text-right">
                  {Math.round(item.temp.min)}°
                </span>
                <div className="w-24 h-2 bg-gradient-to-r from-blue-400 via-yellow-400 to-red-400 rounded-full" />
                <span className="text-slate-900 text-sm font-bold w-12">
                  {Math.round(item.temp.max)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
