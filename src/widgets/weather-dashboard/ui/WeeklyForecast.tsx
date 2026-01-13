import { DailyForecast } from "@shared/api/weather";
import { Card } from "@shared/ui/Card";
import { cn } from "@shared/lib/utils";

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

  return (
    <Card className="flex flex-col p-6 bg-white border border-slate-100 shadow-sm rounded-[2.5rem]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">주간예보</h3>
        <div className="flex gap-2 text-sm text-blue-600 font-medium cursor-pointer">
          <span>최저 최고 기준</span>
        </div>
      </div>
      <div className="flex flex-col divide-y divide-slate-50">
        {daily.map((item, index) => {
          const { dayName, fullDate } = formatDay(item.dt, index);
          const date = new Date(item.dt * 1000);
          const dayOfWeek = date.getDay();
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;

          return (
            <div
              key={item.dt}
              className="flex items-center justify-between py-4 hover:bg-slate-50/50 transition-colors rounded-xl px-2 -mx-2"
            >
              {/* Day & Date */}
              <div className="w-16 flex flex-col gap-0.5">
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
                <span className="text-xs text-slate-400 font-medium">
                  {fullDate}
                </span>
              </div>

              {/* AM/PM Icons (Using same icon for now as API gives daily summary) */}
              <div className="flex items-center gap-6 flex-1 justify-center">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-slate-400 mb-1 opacity-0">
                      오전
                    </span>
                    <span className="text-2xl">
                      {item.weather[0].icon.includes("d") ? "☀️" : "☁️"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 opacity-0">
                      0%
                    </span>
                  </div>
                  {/* Visual Divider/Connector if needed */}
                </div>

                {/* Simulate PM with same icon or logic if available, for now just one icon dominant */}
                {item.pop > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-blue-500">
                      {item.pop}%
                    </span>
                  </div>
                )}
              </div>

              {/* Temp Range */}
              <div className="w-24 flex items-center justify-end gap-3 font-medium">
                <span className="text-blue-600 font-bold text-lg">
                  {Math.round(item.temp.min)}°
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-red-500 font-bold text-lg">
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
