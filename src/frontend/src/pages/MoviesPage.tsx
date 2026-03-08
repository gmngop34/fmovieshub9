import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CategoryFilter } from "../components/CategoryFilter";
import { MovieCard, MovieCardSkeleton } from "../components/MovieCard";
import { searchOmdb } from "../hooks/useOmdb";
import type { OmdbMovie } from "../types/movie";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CATEGORIES = [
  { id: "all", label: "All Movies" },
  { id: "action", label: "Action" },
  { id: "thriller", label: "Thriller" },
  { id: "comedy", label: "Comedy" },
  { id: "horror", label: "Horror" },
  { id: "romance", label: "Romance" },
];

const CATEGORY_QUERIES: Record<string, string[]> = {
  all: ["popular 2024", "blockbuster 2024", "hit movie 2025", "top movie 2023"],
  action: ["action 2024", "action thriller 2024", "action hero 2023"],
  thriller: ["thriller 2024", "mystery thriller 2023", "suspense 2024"],
  comedy: ["comedy 2024", "funny movie 2023", "comedy film 2025"],
  horror: ["horror 2024", "scary movie 2023", "horror thriller 2024"],
  romance: ["romance 2024", "love story 2023", "romantic film 2024"],
};

function pickQuery(category: string): string {
  const queries = CATEGORY_QUERIES[category];
  return queries[Math.floor(Math.random() * queries.length)];
}

export function MoviesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [movies, setMovies] = useState<OmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const randomOffsetRef = useRef(Math.floor(Math.random() * 3) + 1);

  const loadMovies = useCallback(
    async (category: string, pg: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      const q = pickQuery(category);
      // Use random offset for page 1, shift subsequent pages accordingly
      const apiPage =
        pg === 1 ? randomOffsetRef.current : pg + randomOffsetRef.current - 1;
      const data = await searchOmdb(q, "movie", apiPage);
      if (data.Search && data.Search.length > 0) {
        if (append) {
          setMovies((prev) => {
            const existingIds = new Set(prev.map((m) => m.imdbID));
            const newMovies = data.Search!.filter(
              (m) => !existingIds.has(m.imdbID),
            );
            return [...prev, ...newMovies];
          });
        } else {
          // Shuffle first-page results for randomness
          setMovies(shuffleArray(data.Search));
        }
        setHasMore(data.Search.length === 10);
      } else if (pg === 1) {
        // Fallback to page 1 if random page has no results
        const fallback = await searchOmdb(q, "movie", 1);
        if (fallback.Search && fallback.Search.length > 0) {
          setMovies(shuffleArray(fallback.Search));
          setHasMore(fallback.Search.length === 10);
        } else {
          setHasMore(false);
        }
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
    loadMovies(activeCategory, 1, false);
  }, [activeCategory, loadMovies]);

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(activeCategory, nextPage, true);
  }

  function handleCategoryChange(id: string) {
    setActiveCategory(id);
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-28 px-4 md:px-8 lg:px-16 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
          🎬 Movies
        </h1>
        <p className="text-gray-400 text-sm">
          Explore thousands of movies across all genres
        </p>
      </motion.div>

      {/* Category Filter */}
      <div className="mb-6 overflow-x-auto pb-2">
        <CategoryFilter
          categories={CATEGORIES}
          active={activeCategory}
          onChange={handleCategoryChange}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton count
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div
          data-ocid="movies.empty_state"
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-gray-400 text-lg font-medium">No movies found</p>
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
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-8 py-3 bg-[#00dd55] hover:bg-[#00ff66] disabled:opacity-50 text-black font-bold rounded-lg transition-all duration-200"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Movies"
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Footer */}
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
