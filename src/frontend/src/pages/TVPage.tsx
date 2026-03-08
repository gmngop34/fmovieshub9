import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CategoryFilter } from "../components/CategoryFilter";
import { MovieCard, MovieCardSkeleton } from "../components/MovieCard";
import { searchOmdb } from "../hooks/useOmdb";
import type { OmdbMovie } from "../types/movie";

const CATEGORIES = [
  { id: "all", label: "All Series" },
  { id: "drama", label: "Drama" },
  { id: "crime", label: "Crime" },
  { id: "scifi", label: "Sci-Fi" },
  { id: "comedy", label: "Comedy" },
  { id: "fantasy", label: "Fantasy" },
];

const CATEGORY_QUERIES: Record<string, string[]> = {
  all: [
    "popular series 2024",
    "hit series 2023",
    "best TV show 2024",
    "new series 2025",
  ],
  drama: ["drama series 2024", "drama TV 2023", "drama show 2024"],
  crime: ["crime series 2024", "crime drama 2023", "detective series 2024"],
  scifi: ["sci fi series 2024", "science fiction TV 2023", "scifi show 2024"],
  comedy: ["comedy series 2024", "comedy TV show 2023", "sitcom 2024"],
  fantasy: [
    "fantasy series 2024",
    "fantasy TV 2023",
    "supernatural series 2024",
  ],
};

function pickQuery(category: string): string {
  const queries = CATEGORY_QUERIES[category];
  return queries[Math.floor(Math.random() * queries.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TVPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [movies, setMovies] = useState<OmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // Random page offset per session per category so results feel fresh
  const randomOffsetRef = useRef(Math.floor(Math.random() * 3) + 1);

  const loadShows = useCallback(
    async (category: string, pg: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      const q = pickQuery(category);
      // Use random offset for first page to vary results
      const apiPage =
        pg === 1 ? randomOffsetRef.current : pg + randomOffsetRef.current - 1;
      let data = await searchOmdb(q, "series", apiPage);
      // Fallback to page 1 if random page returns nothing
      if (!data.Search || data.Search.length === 0) {
        data = await searchOmdb(q, "series", pg);
      }
      if (data.Search && data.Search.length > 0) {
        const shuffled = pg === 1 ? shuffleArray(data.Search) : data.Search;
        if (append) {
          setMovies((prev) => {
            const existingIds = new Set(prev.map((m) => m.imdbID));
            const newItems = shuffled.filter((m) => !existingIds.has(m.imdbID));
            return [...prev, ...newItems];
          });
        } else {
          setMovies(shuffled);
        }
        setHasMore(data.Search.length === 10);
      } else {
        setHasMore(false);
      }
      setLoading(false);
      setLoadingMore(false);
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadShows(activeCategory, 1, false);
  }, [activeCategory, loadShows]);

  return (
    <div className="min-h-screen bg-[#141414] pt-28 px-4 md:px-8 lg:px-16 pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
          📺 TV Series
        </h1>
        <p className="text-gray-400 text-sm">
          Binge-watch the best TV series from around the world
        </p>
      </motion.div>

      <div className="mb-6 overflow-x-auto pb-2">
        <CategoryFilter
          categories={CATEGORIES}
          active={activeCategory}
          onChange={(id) => {
            setActiveCategory(id);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton count
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div
          data-ocid="tv.empty_state"
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="text-6xl mb-4">📺</div>
          <p className="text-gray-400 text-lg font-medium">No series found</p>
          <p className="text-gray-500 text-sm mt-1">Try a different category</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {movies.map((movie, i) => (
              <MovieCard key={movie.imdbID} movie={movie} index={i} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                type="button"
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  loadShows(activeCategory, nextPage, true);
                }}
                disabled={loadingMore}
                className="flex items-center gap-2 px-8 py-3 bg-[#00dd55] hover:bg-[#00ff66] disabled:opacity-50 text-black font-bold rounded-lg transition-all"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Loading...
                  </>
                ) : (
                  "Load More Series"
                )}
              </button>
            </div>
          )}
        </>
      )}

      <footer className="pt-12 mt-8 border-t border-white/10 text-center">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00dd55] hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
