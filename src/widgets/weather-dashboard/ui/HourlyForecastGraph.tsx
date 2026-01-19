import { useMemo } from "react";
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
import { ForecastData } from "@shared/api/weather";

const getWeatherIcon = (
  iconCode: string,
  className?: string,
  strokeWidth = 1.5,
) => {
  const code = iconCode.slice(0, 2);
  const isDay = iconCode.includes("d");
  let Icon = Cloud;

  switch (code) {
    case "01":
      Icon = isDay ? Sun : Moon;
      break;
    case "02":
    case "03":
    case "04":
      Icon = Cloud;
      break;
    case "09":
      Icon = CloudDrizzle;
      break;
    case "10":
    case "11":
      Icon = CloudRain;
      break;
    case "13":
      Icon = CloudSnow;
      break;
  }
  return <Icon className={className} strokeWidth={strokeWidth} />;
};

interface HourlyForecastGraphProps {
  items: ForecastData["list"];
}

export const HourlyForecastGraph = ({ items }: HourlyForecastGraphProps) => {
  const data = useMemo(() => {
    return items.slice(0, 24).map((item) => ({
      dt: item.dt,
      temp: Math.round(item.main.temp),
      icon: item.weather[0].icon,
      pop: item.pop || 0,
      description: item.weather[0].main,
    }));
  }, [items]);

  if (data.length === 0) return null;

  const itemWidth = 80;
  const graphHeight = 120;
  const topPadding = 30;
  const bottomPadding = 30;

  const temps = data.map((d) => d.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1;

  const getY = (temp: number) => {
    const normalized = (temp - minTemp) / tempRange;
    const availableHeight = graphHeight - topPadding - bottomPadding;
    return graphHeight - bottomPadding - normalized * availableHeight;
  };

  const points = data
    .map((d, i) => {
      const x = i * itemWidth + itemWidth / 2;
      const y = getY(d.temp);
      return `${x},${y}`;
    })
    .join(" ");

  const width = data.length * itemWidth;

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div
        className="relative"
        style={{ width: `${width}px`, height: "200px" }}
      >
        <svg
          width={width}
          height={graphHeight}
          className="absolute top-10 left-0 pointer-events-none"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-slate-300)" />
              <stop offset="100%" stopColor="var(--color-slate-300)" />
            </linearGradient>
          </defs>

          {/* Vertical Lines */}
          {data.map((d, i) => {
            const x = i * itemWidth + itemWidth / 2;
            const y = getY(d.temp);
            return (
              <line
                key={`line-${d.dt}`}
                x1={x}
                y1={y}
                x2={x}
                y2={graphHeight}
                stroke="var(--color-slate-200)"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
            );
          })}

          <polyline
            points={points}
            fill="none"
            stroke="var(--color-slate-300)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-50"
          />

          {data.map((d, i) => {
            const x = i * itemWidth + itemWidth / 2;
            const y = getY(d.temp);
            const isNow = i === 0;

            return (
              <circle
                key={d.dt}
                cx={x}
                cy={y}
                r={isNow ? 4 : 3}
                fill={isNow ? "var(--color-primary-500)" : "white"}
                stroke={isNow ? "white" : "var(--color-slate-300)"}
                strokeWidth={2}
              />
            );
          })}
        </svg>

        <div className="absolute top-0 left-0 w-full h-full flex">
          {data.map((d, i) => {
            const hour = new Date(d.dt * 1000).getHours();
            const isNow = i === 0;
            const y = getY(d.temp);

            const isNewDay = hour === 0;

            return (
              <div
                key={d.dt}
                className="flex flex-col items-center justify-between h-full py-2"
                style={{ width: `${itemWidth}px` }}
              >
                <div style={{ marginTop: `${topPadding + y - 45}px` }}>
                  {" "}
                  <span
                    className={cn(
                      "text-sm font-bold",
                      isNow ? "text-(--primary-600)" : "text-slate-700",
                    )}
                  >
                    {d.temp}°
                  </span>
                </div>

                <div className="flex-1" />

                <div className="flex flex-col items-center gap-1 mb-1">
                  {" "}
                  <div className="h-6 w-6 flex items-center justify-center">
                    {" "}
                    {getWeatherIcon(
                      d.icon,
                      cn(
                        "w-5 h-5",
                        isNow ? "text-(--primary-500)" : "text-slate-500",
                      ),
                    )}
                  </div>
                  {d.pop > 0 ? (
                    <div className="flex items-center gap-0.5">
                      <Droplets className="w-2.5 h-2.5 text-sky-500" />
                      <span className="text-[10px] font-medium text-sky-500">
                        {typeof d.pop === "number" && d.pop <= 1
                          ? Math.round(d.pop * 100)
                          : d.pop}
                        %
                      </span>
                    </div>
                  ) : (
                    <div className="h-3.5" />
                  )}
                  <div className="text-[11px] font-medium text-slate-500">
                    {isNow ? "지금" : isNewDay ? "내일" : `${hour}시`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
