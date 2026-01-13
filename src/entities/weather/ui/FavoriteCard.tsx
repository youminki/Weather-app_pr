import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "@shared/api/weather";
import { Card } from "@shared/ui/Card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { FavoriteLocation, useFavorites } from "@shared/lib/useFavorites";
import { Button } from "@shared/ui/Button";
import { Input } from "@shared/ui/Input";

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

  return (
    <Card
      className="group relative flex flex-col justify-between p-5 h-40 cursor-pointer hover:shadow-md hover:border-slate-300 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] overflow-hidden bg-white border-slate-200"
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 w-full flex justify-between items-start">
        <div className="flex-1">
          {isEditing ? (
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="h-8 text-sm w-32 bg-slate-50 border-slate-200 focus:bg-white"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-green-500 hover:bg-green-50"
                onClick={handleSave}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-500 hover:bg-red-50"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group/edit">
              <h3 className="font-bold text-lg text-slate-900 truncate max-w-37.5">
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
          )}
          <p className="text-sm text-slate-500 mt-1">
            {isEditing ? favorite.name : favorite.alias ? favorite.name : ""}
          </p>
        </div>
        <div className="text-3xl filter drop-shadow-sm">
          {isDay ? "☀️" : "🌙"}
        </div>
      </div>

      <div className="relative z-10 flex items-end justify-between mt-auto">
        <div>
          <span className="text-3xl font-bold text-slate-900 tracking-tight">
            {Math.round(main.temp)}°
          </span>
          <div className="flex gap-2 text-xs text-slate-500 mt-1">
            <span>H:{Math.round(main.temp_max)}°</span>
            <span>L:{Math.round(main.temp_min)}°</span>
          </div>
        </div>
        <div className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
          {weather[0].description}
        </div>
      </div>
    </Card>
  );
};
