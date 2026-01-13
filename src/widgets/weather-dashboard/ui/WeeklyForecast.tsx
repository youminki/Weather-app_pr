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
  const formatPop = (pop: number) => {
    if (pop == null) return "";
    const value = pop > 1 ? Math.round(pop) : Math.round(pop * 100);
    return `${value}%`;
  };
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

  const uniqueDaily: DailyForecast[] = (() => {
    const seen = new Set<string>();
    const out: DailyForecast[] = [];
    for (const d of daily) {
      const dateStr = new Date(d.dt * 1000).toISOString().slice(0, 10);
      if (!seen.has(dateStr)) {
        seen.add(dateStr);
        out.push(d);
      }
      if (out.length >= 10) break;
    }
    return out;
  })();

  return (
    <Card className="w-full bg-white/90 border border-slate-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">주간 예보</h3>
        <span className="text-sm text-slate-500 font-medium">7일간</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {uniqueDaily.map((item, index) => {
          const { dayName, fullDate } = formatDay(item.dt, index);
          const date = new Date(item.dt * 1000);
          const dayOfWeek = date.getDay();
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;

          const Icon = getWeatherIcon(item.weather[0].icon);

          return (
            <div
              key={`${item.dt}-${index}`}
              className="flex items-center justify-between p-2 bg-gray-100 rounded-2xl"
            >
              <div className="flex flex-col">
                <div className="text-sm font-semibold">
                  <span
                    className={cn(
                      isSunday
                        ? "text-red-500"
                        : isSaturday
                        ? "text-blue-500"
                        : "text-slate-800"
                    )}
                  >
                    {index === 0 ? "오늘" : index === 1 ? "내일" : dayName}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{fullDate}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-sm">
                  {React.createElement(Icon, {
                    className: "w-5 h-5 text-slate-700",
                    strokeWidth: 1.5,
                  })}
                </div>
              </div>
              <div className="ml-3 text-right">
                {item.pop > 0 ? (
                  <div className="flex items-center gap-1 justify-end">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span className="text-md font-semibold text-blue-600">
                      {formatPop(item.pop)}
                    </span>
                  </div>
                ) : (
                  <div className="text-m text-slate-400">0%</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-md text-blue-500">
                  {Math.round(item.temp.min)}°
                </div>
                <div className="text-md font-bold text-red-500">
                  {Math.round(item.temp.max)}°
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
