import { Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { MovieCard, MovieCardSkeleton } from "../components/MovieCard";
import { fetchOmdbDetail } from "../hooks/useOmdb";
import type { OmdbMovie } from "../types/movie";

// Classic IMDb top titles
const TOP_IMDB_IDS = [
  "tt0111161", // Shawshank Redemption
  "tt0068646", // The Godfather
  "tt0071562", // The Godfather Part II
  "tt0468569", // The Dark Knight
  "tt0050083", // 12 Angry Men
  "tt0108052", // Schindler's List
  "tt0167260", // Return of the King
  "tt0137523", // Fight Club
  "tt0120737", // Fellowship of the Ring
  "tt0109830", // Forrest Gump
  "tt0167261", // The Two Towers
  "tt1375666", // Inception
  "tt0080684", // The Empire Strikes Back
  "tt0133093", // The Matrix
  "tt0073486", // One Flew Over the Cuckoo's Nest
];

export function TopImdbPage() {
  const [movies, setMovies] = useState<OmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(TOP_IMDB_IDS.map((id) => fetchOmdbDetail(id))).then(
      (details) => {
        const valid = details
          .filter((d) => d.Response === "True")
          .map(
            (d) =>
              ({
                imdbID: d.imdbID,
                Title: d.Title,
                Year: d.Year,
                Type: d.Type,
                Poster: d.Poster,
              }) as OmdbMovie,
          );
        setMovies(valid);
        setLoading(false);
      },
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#141414] pt-28 px-4 md:px-8 lg:px-16 pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center">
            <Star size={20} className="text-yellow-400 fill-yellow-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
            Top IMDb
          </h1>
        </div>
        <p className="text-gray-400 text-sm">
          The highest-rated movies of all time according to IMDb
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton count
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div
          data-ocid="topimdb.empty_state"
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="text-6xl mb-4">⭐</div>
          <p className="text-gray-400 text-lg font-medium">No data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {movies.map((movie, i) => (
            <div key={movie.imdbID} className="relative">
              <div className="absolute -top-2 -left-1 z-10 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center">
                <span className="text-black font-bold text-xs">#{i + 1}</span>
              </div>
              <MovieCard movie={movie} index={i} />
            </div>
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
