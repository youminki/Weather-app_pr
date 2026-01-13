import { useFavorites } from "@shared/lib/useFavorites";
import { FavoriteCard } from "@entities/weather/ui/FavoriteCard";

export const FavoritesList = () => {
  const { favorites } = useFavorites();

  return (
    <div className="w-full max-w-4xl mt-12 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">즐겨찾기</h2>
      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
          <p className="text-slate-500">즐겨찾기한 장소가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <FavoriteCard key={fav.id} favorite={fav} />
          ))}
        </div>
      )}
    </div>
  );
};
