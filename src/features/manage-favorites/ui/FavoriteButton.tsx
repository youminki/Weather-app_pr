import { Star } from "lucide-react";
import { useFavorites } from "@shared/lib/useFavorites";
import { Button } from "@shared/ui/Button";

interface FavoriteButtonProps {
  location: { lat: number; lon: number; name: string };
}

export const FavoriteButton = ({ location }: FavoriteButtonProps) => {
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const id = `${location.lat}-${location.lon}`;
  const isFavorite = favorites.some((f) => f.id === id);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(id);
    } else {
      addFavorite({
        lat: location.lat,
        lon: location.lon,
        name: location.name,
      });
    }
  };

  return (
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
  );
};
