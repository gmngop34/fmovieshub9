import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { MovieCard, MovieCardSkeleton } from "../components/MovieCard";
import { searchOmdb } from "../hooks/useOmdb";
import type { OmdbMovie } from "../types/movie";

const TRENDING_QUERIES = ["blockbuster 2024", "popular 2024", "hit movie 2023"];

export function TrendingPage() {
  const [movies, setMovies] = useState<OmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(TRENDING_QUERIES.map((q) => searchOmdb(q))).then((results) => {
      const all: OmdbMovie[] = [];
      const seen = new Set<string>();
      for (const r of results) {
        if (r.Search) {
          for (const m of r.Search) {
            if (!seen.has(m.imdbID)) {
              seen.add(m.imdbID);
              all.push(m);
            }
          }
        }
      }
      setMovies(all.slice(0, 30));
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#141414] pt-28 px-4 md:px-8 lg:px-16 pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#00dd55]/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-[#00dd55]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
            Trending
          </h1>
        </div>
        <p className="text-gray-400 text-sm">
          What everyone is watching right now
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton count
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div
          data-ocid="trending.empty_state"
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="text-6xl mb-4">🔥</div>
          <p className="text-gray-400 text-lg font-medium">
            Nothing trending right now
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {movies.map((movie, i) => (
            <MovieCard key={movie.imdbID} movie={movie} index={i} />
          ))}
        </div>
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
