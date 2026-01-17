import { useFavorites } from "@shared/lib/useFavorites";
import { FavoriteCard } from "@entities/weather/ui/FavoriteCard";
import { Card, CardContent } from "@shared/ui";

export const FavoritesList = () => {
  const { favorites } = useFavorites();

  return (
    <div className="w-full mt-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-slate-900">즐겨찾기</h2>
      {favorites.length === 0 ? (
        <Card className="text-center py-8 bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-[2rem] shadow-lg shadow-slate-200/30">
          <CardContent>
            <p className="text-slate-500 text-[17px] font-medium py-8">
              즐겨찾기한 장소가 없습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {favorites.map((fav) => (
            <FavoriteCard key={fav.id} favorite={fav} />
          ))}
        </div>
      )}
    </div>
  );
};
