import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { CategoryFilter } from "../components/CategoryFilter";
import { MovieCard, MovieCardSkeleton } from "../components/MovieCard";
import { fetchOmdbDetail, searchOmdb } from "../hooks/useOmdb";
import type { OmdbDetail, OmdbMovie } from "../types/movie";

const CATEGORIES = [
  { id: "featured", label: "Featured" },
  { id: "popular", label: "Most Favorite" },
  { id: "top-imdb", label: "Top IMDb" },
  { id: "new-release", label: "New Release" },
  { id: "trending", label: "Trending" },
];

const CATEGORY_QUERIES: Record<string, { q: string; type?: string }> = {
  featured: { q: "award winning" },
  popular: { q: "most popular" },
  "top-imdb": { q: "top rated" },
  "new-release": { q: "2025" },
  trending: { q: "trending 2024" },
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomPage(): number {
  return Math.floor(Math.random() * 3) + 1;
}

// Hero featured movies (top picks) — diverse genres
const HERO_MOVIE_IDS = [
  "tt0468569", // The Dark Knight
  "tt4574334", // Stranger Things
  "tt1375666", // Inception
  "tt0816692", // Interstellar
  "tt0944947", // Game of Thrones
];

export function HomePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("featured");
  const [movies, setMovies] = useState<OmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroDetails, setHeroDetails] = useState<(OmdbDetail | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);

  // Pre-fetch hero detail data for all hero movies
  useEffect(() => {
    HERO_MOVIE_IDS.forEach((id, idx) => {
      fetchOmdbDetail(id).then((data) => {
        setHeroDetails((prev) => {
          const next = [...prev];
          next[idx] = data.Response === "True" ? data : null;
          return next;
        });
      });
    });
  }, []);

  // Cycle hero every 6s
  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_MOVIE_IDS.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setLoading(true);
    const { q, type } = CATEGORY_QUERIES[activeCategory];
    searchOmdb(q, type, randomPage()).then((data) => {
      if (data.Search) {
        setMovies(shuffleArray(data.Search).slice(0, 8));
      } else {
        // Fallback to page 1 if random page has no results
        searchOmdb(q, type, 1).then((d) => {
          setMovies(d.Search ? shuffleArray(d.Search).slice(0, 8) : []);
          setLoading(false);
        });
        return;
      }
      setLoading(false);
    });
  }, [activeCategory]);

  const hero = heroDetails[heroIndex];
  const heroId = HERO_MOVIE_IDS[heroIndex];

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Hero Section */}
      <section className="relative h-[85vw] max-h-[95vh] min-h-[420px] md:h-[75vh] overflow-hidden">
        {/* Background poster */}
        <AnimatePresence mode="sync">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                hero?.Poster && hero.Poster !== "N/A"
                  ? `url(${hero.Poster.replace("SX300", "SX800")})`
                  : `url(https://img.omdbapi.com/?i=${heroId}&apikey=986f8163)`,
            }}
          />
        </AnimatePresence>

        {/* Dark gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />

        {/* Bottom content — title + info + button */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-10 px-5 md:px-12 pt-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-3 leading-tight drop-shadow-lg">
                {hero?.Title ?? "Loading..."}
              </h1>

              {/* Meta row */}
              <div className="flex items-center gap-3 flex-wrap mb-3">
                <span className="px-2 py-0.5 bg-[#00dd55] text-black text-xs font-bold rounded">
                  HD
                </span>
                {hero?.Runtime && hero.Runtime !== "N/A" && (
                  <span className="text-gray-200 text-sm">
                    Duration:{" "}
                    <span className="font-semibold">{hero.Runtime}</span>
                  </span>
                )}
                {hero?.imdbRating && hero.imdbRating !== "N/A" && (
                  <span className="text-gray-200 text-sm">
                    IMDB:{" "}
                    <span className="font-semibold text-[#00dd55]">
                      {hero.imdbRating}
                    </span>
                  </span>
                )}
              </div>

              {/* Genre row */}
              {hero?.Genre && hero.Genre !== "N/A" && (
                <p className="text-gray-300 text-sm mb-5">
                  Genre: <span className="text-white">{hero.Genre}</span>
                </p>
              )}

              {/* Watch now button */}
              <button
                type="button"
                data-ocid="hero.watch_button"
                onClick={() => navigate({ to: `/player/${heroId}` })}
                className="flex items-center gap-2 px-7 py-3 border-2 border-[#00dd55] text-[#00dd55] hover:bg-[#00dd55] hover:text-black font-bold rounded-full transition-all duration-200 text-sm"
              >
                <Play size={16} fill="currentColor" />
                Watch now
              </button>
            </motion.div>
          </AnimatePresence>

          {/* Slide indicator dots */}
          <div className="flex justify-center gap-2 mt-6">
            {HERO_MOVIE_IDS.map((id, idx) => (
              <button
                key={id}
                type="button"
                onClick={() => setHeroIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${idx === heroIndex ? "w-8 bg-[#00dd55]" : "w-5 bg-white/30 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-4 md:px-8 lg:px-16 py-8 space-y-8">
        {/* Category Filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <CategoryFilter
            categories={CATEGORIES}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        {/* Movies Grid */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white text-xl md:text-2xl font-display font-bold">
              {CATEGORIES.find((c) => c.id === activeCategory)?.label ??
                "Popular"}
            </h2>
            <a
              data-ocid="home.viewmore_link"
              href="/movies"
              onClick={(e) => {
                e.preventDefault();
                navigate({ to: "/movies" });
              }}
              className="flex items-center gap-1 text-[#00dd55] hover:text-[#00ff66] text-sm font-medium transition-colors"
            >
              View More <ChevronRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton count
                <MovieCardSkeleton key={i} />
              ))
            ) : movies.length === 0 ? (
              <div
                data-ocid="home.movies.empty_state"
                className="col-span-full py-20 text-center text-gray-500"
              >
                No movies found. Try another category.
              </div>
            ) : (
              movies.map((movie, i) => (
                <MovieCard key={movie.imdbID} movie={movie} index={i} />
              ))
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 mt-8 border-t border-white/10 text-center">
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
    </div>
  );
}
