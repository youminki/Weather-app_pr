import { useState, useRef, useEffect } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { useFavorites } from "@shared/lib/useFavorites";
import {
  searchDistricts,
  District,
  getCoordsForDistrict,
} from "@shared/api/location";
import { getGeoLocationWithFallback as getGeoLocation } from "@shared/api/weather";
import { useDebounce } from "@shared/lib/useDebounce";
import { cn } from "@shared/lib/utils";

interface LocationSearchProps {
  onSelect: (location: { name: string; lat: number; lon: number }) => void;
  className?: string;
}

export const LocationSearch = ({
  onSelect,
  className,
}: LocationSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<District[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 100);
  const { favorites } = useFavorites();

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length > 1) {
        setLoading(true);
        try {
          const matches = await searchDistricts(debouncedQuery);
          setResults(matches);
          setIsOpen(true);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
        setLoading(false);
      }
    };
    fetchResults();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (placeString: string) => {
    setLoading(true);
    const searchQuery = placeString.replace(/-/g, " ");

    let coords = await getCoordsForDistrict(placeString);

    if (!coords) {
      const geo = await getGeoLocation(searchQuery);
      coords = geo ? { lat: geo.lat, lon: geo.lon } : null;
    }

    setLoading(false);

    if (coords) {
      onSelect({ name: placeString, lat: coords.lat, lon: coords.lon });
      setQuery("");
      setIsOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
    } else {
      alert("위치 정보를 찾을 수 없습니다.");
    }
  };

  return (
    <div
      className={cn("relative w-full max-w-2xl", className)}
      ref={wrapperRef}
    >
      <div
        className={cn(
          "relative flex items-center transition-all duration-200",
          "bg-white rounded-2xl",
          "border",
          isFocused
            ? "border-[color:var(--primary-500)] shadow-lg shadow-[color:var(--primary-500)]/20"
            : "border-slate-200 shadow-sm"
        )}
      >
        <div className="absolute left-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          ) : (
            <Search
              className={cn(
                "w-5 h-5 transition-colors duration-200",
                isFocused ? "text-[color:var(--primary-500)]" : "text-slate-400"
              )}
            />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="지역을 검색하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          className={cn(
            "w-full h-12 pl-12 pr-4",
            "bg-transparent outline-none",
            "text-[15px] text-base-primary placeholder:text-muted",
            "transition-all duration-200"
          )}
        />
      </div>

      {isOpen && query.length === 0 ? (
        <div
          className={cn(
            "absolute w-full mt-2 z-50",
            "bg-white rounded-2xl",
            "border border-slate-200 shadow-xl",
            "overflow-hidden",
            "animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          <ul className="max-h-[60vh] overflow-y-auto">
            {favorites.length === 0 ? (
              <li className="px-4 py-3 text-slate-500">즐겨찾기가 없습니다.</li>
            ) : (
              favorites.map((fav) => (
                <li
                  key={fav.id}
                  onClick={() => {
                    onSelect({ name: fav.name, lat: fav.lat, lon: fav.lon });
                    setQuery("");
                    setIsOpen(false);
                    setIsFocused(false);
                    inputRef.current?.blur();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    "cursor-pointer transition-colors duration-150",
                    "hover:bg-slate-50 active:bg-slate-100",
                    "border-b border-slate-100 last:border-0"
                  )}
                >
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-[15px] text-slate-900">{fav.name}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : (
        isOpen &&
        results.length > 0 && (
          <div
            className={cn(
              "absolute w-full mt-2 z-50",
              "bg-white rounded-2xl",
              "border border-slate-200 shadow-xl",
              "overflow-hidden",
              "animate-in fade-in slide-in-from-top-2 duration-200"
            )}
          >
            <ul className="max-h-[60vh] overflow-y-auto">
              {results.map((place, idx) => (
                <li
                  key={`${place}-${idx}`}
                  onClick={() => handleSelect(place)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    "cursor-pointer transition-colors duration-150",
                    "hover:bg-slate-50 active:bg-slate-100",
                    "border-b border-slate-100 last:border-0"
                  )}
                >
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-[15px] text-slate-900 truncate">
                    {place.replace(/-/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )
      )}

      {isOpen && query.length > 1 && results.length === 0 && !loading && (
        <div
          className={cn(
            "absolute w-full mt-2 z-50",
            "bg-white rounded-2xl",
            "border border-slate-200 shadow-xl",
            "p-6 text-center",
            "animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          <p className="text-[15px] text-slate-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
};
