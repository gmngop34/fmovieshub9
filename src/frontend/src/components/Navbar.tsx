import { useNavigate } from "@tanstack/react-router";
import { Film, Menu, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { searchOmdb } from "../hooks/useOmdb";
import type { OmdbMovie } from "../types/movie";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<OmdbMovie[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchChange(val: string) {
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const data = await searchOmdb(val.trim());
      setSearching(false);
      if (data.Search) {
        setResults(data.Search.slice(0, 8));
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(true);
      }
    }, 400);
  }

  function handleResultClick(imdbId: string) {
    setShowDropdown(false);
    setSearchQuery("");
    navigate({ to: `/player/${imdbId}` });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (results.length > 0) {
      handleResultClick(results[0].imdbID);
    }
  }

  return (
    <header className="nav-glass fixed top-0 left-0 right-0 z-50">
      {/* Top row: hamburger + logo + desktop nav */}
      <div className="flex items-center h-14 px-4 md:px-8 gap-4">
        {/* Hamburger */}
        <button
          type="button"
          data-ocid="nav.menu_button"
          onClick={onMenuClick}
          className="text-white hover:text-[#00dd55] transition-colors p-2 rounded-md hover:bg-white/5 flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Logo */}
        <a
          data-ocid="nav.home_link"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate({ to: "/" });
          }}
          className="brand-text text-xl md:text-2xl tracking-tight flex-shrink-0 flex items-center gap-2"
        >
          <Film size={22} className="text-[#00dd55]" />
          FreeMoviesHUB
        </a>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {[
            { label: "Home", to: "/" },
            { label: "Movies", to: "/movies" },
            { label: "TV Series", to: "/tv" },
            { label: "Anime", to: "/anime" },
            { label: "Trending", to: "/trending" },
            { label: "Top IMDb", to: "/top-imdb" },
          ].map((item) => (
            <a
              key={item.to}
              href={item.to}
              onClick={(e) => {
                e.preventDefault();
                navigate({ to: item.to });
              }}
              className="px-3 py-1.5 text-sm text-gray-300 hover:text-[#00dd55] transition-colors rounded-md hover:bg-white/5 font-medium"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Search row: always visible below the logo row */}
      <div className="px-4 md:px-8 pb-2" ref={searchRef}>
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full max-w-2xl mx-auto"
        >
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            data-ocid="nav.search_input"
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search movies, series, anime..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#00dd55] focus:bg-white/15 transition-all"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#00dd55] border-t-transparent rounded-full animate-spin" />
          )}

          {/* Dropdown */}
          {showDropdown && (
            <div className="search-dropdown absolute top-full left-0 right-0 mt-2 z-50">
              {results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">
                  No results found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                results.map((movie) => (
                  <button
                    type="button"
                    key={movie.imdbID}
                    className="search-result-item w-full text-left"
                    onClick={() => handleResultClick(movie.imdbID)}
                  >
                    <img
                      src={
                        movie.Poster !== "N/A"
                          ? movie.Poster
                          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='55' viewBox='0 0 40 55'%3E%3Crect width='40' height='55' fill='%231a1a1a'/%3E%3C/svg%3E"
                      }
                      alt={movie.Title}
                      className="w-10 h-14 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {movie.Title}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {movie.Year} • {movie.Type}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </form>
      </div>
    </header>
  );
}
