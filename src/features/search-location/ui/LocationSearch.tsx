import { useState, useRef, useEffect } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { searchDistricts, District } from "@shared/api/location";
import { getGeoLocation } from "@shared/api/weather";
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

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length > 1) {
        setLoading(true);
        try {
          const matches = await searchDistricts(debouncedQuery);
          setResults(matches);
          setIsOpen(true);
        } catch (e) {
          console.error(e);
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

    const coords = await getGeoLocation(searchQuery);
    setLoading(false);

    if (coords) {
      onSelect({
        name: placeString,
        lat: coords.lat,
        lon: coords.lon,
      });
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
      {/* iOS 스타일 검색바 */}
      <div
        className={cn(
          "relative flex items-center transition-all duration-200",
          "bg-white rounded-2xl",
          "border",
          isFocused
            ? "border-blue-500 shadow-lg shadow-blue-500/20"
            : "border-slate-200 shadow-sm"
        )}
      >
        {/* 검색 아이콘 */}
        <div className="absolute left-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          ) : (
            <Search
              className={cn(
                "w-5 h-5 transition-colors duration-200",
                isFocused ? "text-blue-500" : "text-slate-400"
              )}
            />
          )}
        </div>

        {/* 검색 입력 */}
        <input
          ref={inputRef}
          type="text"
          placeholder="지역을 검색하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className={cn(
            "w-full h-12 pl-12 pr-4",
            "bg-transparent outline-none",
            "text-[15px] text-slate-900 placeholder:text-slate-400",
            "transition-all duration-200"
          )}
        />
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && results.length > 0 && (
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
                <span className="text-[15px] text-slate-900">
                  {place.replace(/-/g, " ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 검색 결과 없음 */}
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
