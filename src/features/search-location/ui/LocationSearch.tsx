import { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@shared/ui/Input";
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
  const wrapperRef = useRef<HTMLDivElement>(null);

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
    } else {
      alert("위치 정보를 찾을 수 없습니다.");
    }
  };

  return (
    <div
      className={cn("relative w-full max-w-md z-50", className)}
      ref={wrapperRef}
    >
      <div className="relative group">
        <Input
          placeholder="지역 검색 (예: 종로구, 강남구)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11 bg-white border-slate-200 focus:bg-white focus:border-slate-300 transition-all duration-300 shadow-sm text-lg h-14 rounded-[2rem]"
        />
        {loading ? (
          <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 animate-spin" />
        ) : (
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-slate-600 transition-colors" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute w-full mt-2 bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden max-h-[60vh] overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-200">
          {results.map((place, idx) => (
            <li
              key={`${place}-${idx}`}
              className="px-6 py-4 hover:bg-slate-50 cursor-pointer text-slate-700 transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between group"
              onClick={() => handleSelect(place)}
            >
              <div className="font-medium text-slate-900 break-keep group-hover:translate-x-1 transition-transform">
                {place.replace(/-/g, " ")}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.length > 1 && results.length === 0 && !loading && (
        <div className="absolute w-full mt-2 bg-white border border-slate-100 rounded-3xl shadow-lg p-6 text-center text-slate-500 animate-in fade-in zoom-in-95">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
};
