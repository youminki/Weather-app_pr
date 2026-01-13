import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "@shared/api/weather";
import { Card } from "@shared/ui/Card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Pencil, Check, X, MapPin, Cloud, Sun } from "lucide-react";
import { FavoriteLocation, useFavorites } from "@shared/lib/useFavorites";
import { Button } from "@shared/ui/Button";

interface FavoriteCardProps {
  favorite: FavoriteLocation;
}

export const FavoriteCard = ({ favorite }: FavoriteCardProps) => {
  const navigate = useNavigate();
  const { updateAlias } = useFavorites();
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
    return <Card className="p-6 animate-pulse bg-white/5">Loading...</Card>;

  const { main, weather } = data;
  const iconCode = weather[0].icon;
  const isDay = iconCode.includes("d");

  const WeatherIcon = isDay ? Sun : Cloud;

  return (
    <Card
      className="group relative cursor-pointer hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] overflow-hidden bg-white/90 border-slate-200/50 p-5"
      onClick={handleCardClick}
    >
      {isEditing ? (
        <div
          className="flex items-center gap-2 mb-4"
          onClick={(e) => e.stopPropagation()}
        >
          <input
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
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 group/edit flex-1">
            <MapPin className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-lg text-slate-900 truncate">
              {favorite.alias || favorite.name}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover/edit:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
              onClick={handleEditClick}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <WeatherIcon className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
          <div>
            <div className="text-3xl font-bold text-slate-900">
              {Math.round(main.temp)}°
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {weather[0].description}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium mb-1">
            최고/최저
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-red-500">{Math.round(main.temp_max)}°</span>
            <span className="text-slate-300">·</span>
            <span className="text-blue-500">{Math.round(main.temp_min)}°</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
