import { useEffect, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { useGeolocation } from "@shared/lib/useGeolocation";
import { LocationSearch } from "@features/search-location/ui/LocationSearch";
import { FavoritesList } from "@widgets/favorites-list/ui/FavoritesList";
import { Loader2 } from "lucide-react";

const WeatherDashboard = lazy(() =>
  import("@widgets/weather-dashboard/ui/WeatherDashboard").then((module) => ({
    default: module.WeatherDashboard,
  }))
);

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useGeolocation();

  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");
  const nameParam = searchParams.get("name");

  const onSelectLocation = (loc: {
    lat: number;
    lon: number;
    name: string;
  }) => {
    setSearchParams({
      lat: loc.lat.toString(),
      lon: loc.lon.toString(),
      name: loc.name,
    });
  };

  const showDashboard = latParam && lonParam;

  useEffect(() => {
    if (!latParam && !lonParam && location.loaded && location.coordinates) {
      setSearchParams({
        lat: location.coordinates.lat.toString(),
        lon: location.coordinates.lng.toString(),
        name: "현재 위치",
      });
    }
  }, [location, latParam, lonParam, setSearchParams]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 overflow-x-hidden">
      <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-start gap-6 px-4 pt-12">
        <main className="w-full md:flex-1 md:max-w-[600px]">
          <header className="w-full mb-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                날씨
              </h1>
              <p className="text-sm text-slate-500">오늘의 날씨를 확인하세요</p>
            </div>
            <div className="mt-4">
              <LocationSearch onSelect={onSelectLocation} />
            </div>
          </header>

          <div className="w-full flex flex-col items-start min-h-[500px] gap-8">
            {showDashboard ? (
              <Suspense
                fallback={
                  <div className="w-full h-96 flex flex-col items-center justify-center gap-4 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
                    <p className="text-lg font-medium">날씨 데이터 로딩중...</p>
                  </div>
                }
              >
                <WeatherDashboard
                  lat={parseFloat(latParam)}
                  lon={parseFloat(lonParam)}
                  locationName={nameParam || "알 수 없는 위치"}
                />
              </Suspense>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500 animate-pulse mt-12 w-full">
                {location.error ? (
                  <p>위치 서비스를 켜거나 도시를 검색해주세요.</p>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                    <p>현재 위치를 찾는 중...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <aside className="w-full md:w-[400px] md:flex-none">
          <FavoritesList />
        </aside>
      </div>
    </div>
  );
};
