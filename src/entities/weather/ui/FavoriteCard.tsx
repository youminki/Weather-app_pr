import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "@shared/api/weather";
import { Card, CardHeader, CardContent, Button, Input } from "@shared/ui";
import { Popover, PopoverTrigger, PopoverContent } from "@shared/ui";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Check, X, MapPin, Cloud, Sun, MoreHorizontal } from "lucide-react";
import { FavoriteLocation, useFavorites } from "@shared/lib/useFavorites";

interface FavoriteCardProps {
  favorite: FavoriteLocation;
}

export const FavoriteCard = ({ favorite }: FavoriteCardProps) => {
  const navigate = useNavigate();
  const { updateAlias, removeFavorite } = useFavorites();
  const [isEditing, setIsEditing] = useState(false);
  const [alias, setAlias] = useState(favorite.alias || "");

  const { data } = useQuery({
    queryKey: ["weather", favorite.lat, favorite.lon],
    queryFn: () => weatherApi.getCurrentWeather(favorite.lat, favorite.lon),
  });

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateAlias(favorite.id, alias || undefined);
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAlias(favorite.alias || "");
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCardClick = () => {
    if (!isEditing) {
      navigate(
        `/?lat=${favorite.lat}&lon=${favorite.lon}&name=${
          favorite.alias || favorite.name
        }`
      );
    }
  };

  if (!data)
    return (
      <Card className="p-6 animate-pulse bg-white/5">
        <CardContent>Loading...</CardContent>
      </Card>
    );

  const { main, weather } = data;
  const iconCode = weather[0].icon;
  const isDay = iconCode.includes("d");

  const WeatherIcon = isDay ? Sun : Cloud;

  return (
    <Card
      className="group relative cursor-pointer hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] overflow-hidden bg-white/90 border-slate-200/50 p-4 sm:p-5"
      onClick={handleCardClick}
    >
      <CardHeader onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <div className="flex items-center gap-2 mb-0 w-full">
            <Input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="h-9 text-[15px] flex-1 bg-slate-50/80 backdrop-blur-sm border border-slate-200 rounded-xl px-3 outline-none focus:border-blue-500 focus:bg-white transition-all"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-green-500 hover:bg-green-50/80"
              onClick={handleSave}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-red-500 hover:bg-red-50/80"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-start justify-between w-full">
            <div className="flex items-center gap-2 group/edit flex-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              <h3 className="font-bold text-lg text-slate-900 truncate">
                {favorite.alias || favorite.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover/edit:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
                    aria-label="더보기"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="p-2">
                  <button
                    className="w-full text-left text-sm px-2 py-1 hover:bg-slate-100 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(e as unknown as React.MouseEvent);
                    }}
                  >
                    편집
                  </button>
                  <button
                    className="w-full text-left text-sm px-2 py-1 text-red-500 hover:bg-red-50 rounded mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `즐겨찾기 '${
                            favorite.alias || favorite.name
                          }'을(를) 삭제하시겠습니까?`
                        )
                      ) {
                        removeFavorite(favorite.id);
                      }
                    }}
                  >
                    삭제
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <WeatherIcon
              className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500"
              strokeWidth={1.5}
            />
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {Math.round(main.temp)}°
              </div>
              <p className="text-sm text-slate-500 font-medium mt-1 w-full sm:max-w-[18rem] truncate">
                {weather[0].description}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium mb-1">
              최고/최저
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="text-red-500 text-sm sm:text-base">
                {Math.round(main.temp_max)}°
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-blue-500 text-sm sm:text-base">
                {Math.round(main.temp_min)}°
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
