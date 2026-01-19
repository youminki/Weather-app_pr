import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "@shared/api/weather";
import { Card, CardHeader, CardContent, Button, Input } from "@shared/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@shared/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Check, X, MapPin, Cloud, Sun, Pencil, Trash2 } from "lucide-react";
import { FavoriteLocation, useFavorites } from "@shared/lib/useFavorites";

interface FavoriteCardProps {
  favorite: FavoriteLocation;
}

export const FavoriteCard = ({ favorite }: FavoriteCardProps) => {
  const navigate = useNavigate();
  const { updateAlias, removeFavorite } = useFavorites();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
    setAlias(favorite.alias || "");
    setIsEditing(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const [showDeleteError, setShowDeleteError] = useState(false);

  const confirmDelete = () => {
    const ok = removeFavorite(favorite.id);
    setShowDeleteConfirm(false);
    if (!ok) setShowDeleteError(true);
  };

  const handleCardClick = () => {
    if (!isEditing) {
      navigate(
        `/?lat=${favorite.lat}&lon=${favorite.lon}&name=${
          favorite.alias || favorite.name
        }`,
      );
    }
  };

  if (!data)
    return (
      <Card className="p-6 bg-white/5">
        <CardContent>Loading...</CardContent>
      </Card>
    );

  const { main, weather } = data;
  const iconCode = weather[0].icon;
  const isDay = iconCode.includes("d");

  const WeatherIcon = isDay ? Sun : Cloud;

  return (
    <>
      <Card
        className="group relative cursor-pointer overflow-hidden bg-white/90 border-slate-200/50 p-4 hover:shadow-sm transition-shadow duration-150"
        onClick={handleCardClick}
      >
        <CardHeader onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <div className="flex items-center gap-2 mb-0 w-full">
              <Input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="h-9 text-sm flex-1 bg-slate-50/80 backdrop-blur-sm border border-slate-200 rounded-xl px-3 outline-none focus:border-blue-500 focus:bg-white transition-all"
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <h3 className="font-semibold text-base text-slate-900 truncate">
                    {favorite.alias || favorite.name}
                  </h3>
                </div>
                {favorite.alias && (
                  <div className="text-xs text-slate-400 mt-1 truncate">
                    {favorite.name}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4 opacity-90">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 px-2 py-1 text-sm text-slate-700 hover:text-white hover:bg-blue-500"
                  onClick={handleEditClick}
                  title="별칭 수정"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="whitespace-nowrap">수정</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 px-2 py-1 text-sm text-slate-700 hover:text-white hover:bg-red-500"
                  onClick={handleDeleteClick}
                  title="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="whitespace-nowrap">삭제</span>
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <WeatherIcon
                className="w-12 h-12 text-blue-500"
                strokeWidth={1.5}
              />
              <div className="min-w-0">
                <div className="text-2xl font-bold text-slate-900">
                  {Math.round(main.temp)}°
                </div>
                <p className="text-sm text-slate-500 font-medium mt-1 truncate">
                  {weather[0].description}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium mb-1">
                최고/최저
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold justify-end">
                <span className="text-red-500 text-base">
                  {Math.round(main.temp_max)}°
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-blue-500 text-base">
                  {Math.round(main.temp_min)}°
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>즐겨찾기 삭제</DialogTitle>
            <DialogDescription>
              '{favorite.alias || favorite.name}'을(를) 즐겨찾기에서
              삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter row>
            <DialogClose asChild>
              <Button variant="outline" className="w-full">
                취소
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="w-full"
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showDeleteError} onOpenChange={setShowDeleteError}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>삭제 실패</DialogTitle>
            <DialogDescription>
              즐겨찾기 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter row>
            <div />
            <Button
              className="w-full"
              onClick={() => setShowDeleteError(false)}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
