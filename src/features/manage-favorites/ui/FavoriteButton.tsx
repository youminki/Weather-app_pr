import { useState } from "react";
import { Star } from "lucide-react";
import { useFavorites } from "@shared/lib/useFavorites";
import { Button } from "@shared/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@shared/ui/dialog";

interface FavoriteButtonProps {
  location: { lat: number; lon: number; name: string };
}

export const FavoriteButton = ({ location }: FavoriteButtonProps) => {
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const [showError, setShowError] = useState(false);

  const id = `${location.lat}-${location.lon}`;
  const isFavorite = favorites.some((f) => f.id === id);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(id);
    } else {
      const success = addFavorite({
        lat: location.lat,
        lon: location.lon,
        name: location.name,
      });
      if (!success) {
        setShowError(true);
      }
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFavorite}
        className={
          isFavorite
            ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50/80 hover:scale-110 transition-all duration-200"
            : "text-slate-300 hover:text-slate-500 hover:bg-slate-50/80 hover:scale-110 transition-all duration-200"
        }
      >
        <Star className={isFavorite ? "fill-current w-6 h-6" : "w-6 h-6"} />
      </Button>

      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>즐겨찾기 추가 불가</DialogTitle>
            <DialogDescription>
              즐겨찾기는 최대 6개까지만 등록할 수 있습니다.
              <br />
              불필요한 항목을 삭제한 뒤 다시 시도해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="w-full" onClick={() => setShowError(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
