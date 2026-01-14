import { useFavorites } from "@shared/lib/useFavorites";
import { FavoriteCard } from "@entities/weather/ui/FavoriteCard";
import { useQuery } from "@tanstack/react-query";
import { weatherApi } from "@shared/api/weather";

export const FavoritesList = () => {
  const { favorites } = useFavorites();

  type FavoriteSummary = {
    temp: number;
    temp_min: number;
    temp_max: number;
    icon: string;
    description: string;
    lat: number;
    lon: number;
  };

  const { data: summaries } = useQuery<
    Record<string, FavoriteSummary> | undefined
  >({
    queryKey: ["favorites-weather", favorites.map((f) => f.id)],
    queryFn: () =>
      weatherApi.getCurrentWeatherBatch(
        favorites.map((f) => ({ id: f.id, lat: f.lat, lon: f.lon }))
      ),
    enabled: favorites.length > 0,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <div className="w-full max-w-5xl mt-16 mb-8">
      <h2 className="text-3xl font-bold mb-8 text-slate-900">즐겨찾기</h2>
      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-[2rem] shadow-lg shadow-slate-200/30">
          <p className="text-slate-500 text-[17px] font-medium">
            즐겨찾기한 장소가 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((fav) => (
            <FavoriteCard
              key={fav.id}
              favorite={fav}
              summary={summaries ? summaries[fav.id] : undefined}
              parentLoading={summaries === undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
