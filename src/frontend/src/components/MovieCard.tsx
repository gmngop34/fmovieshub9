import { useNavigate } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import { useOmdbRating } from "../hooks/useOmdb";
import { useGetQualityLabel } from "../hooks/useQueries";
import type { OmdbMovie } from "../types/movie";
import { assignRandomQuality, getQualityClass } from "../types/movie";

interface MovieCardProps {
  movie: OmdbMovie;
  index?: number;
}

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='445' viewBox='0 0 300 445'%3E%3Crect width='300' height='445' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23444' font-size='14' font-family='sans-serif'%3ENo Poster%3C/text%3E%3C/svg%3E";

function QualityBadge({ imdbId }: { imdbId: string }) {
  const { data: backendLabel } = useGetQualityLabel(imdbId);
  const quality = backendLabel ?? assignRandomQuality(imdbId);
  const cls = getQualityClass(quality);

  return <span className={`quality-badge ${cls}`}>{quality}</span>;
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const navigate = useNavigate();
  const poster = movie.Poster !== "N/A" ? movie.Poster : PLACEHOLDER;
  const { data: rating } = useOmdbRating(movie.imdbID);

  function handleClick() {
    navigate({ to: `/player/${movie.imdbID}` });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="movie-card group"
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      aria-label={`Watch ${movie.Title}`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={poster}
          alt={movie.Title}
          className="card-image w-full h-full object-cover transition-all duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER;
          }}
        />

        {/* Quality Badge */}
        <QualityBadge imdbId={movie.imdbID} />

        {/* Hover overlay */}
        <div className="card-overlay absolute inset-0 opacity-0 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 bg-black/50">
          <div className="w-14 h-14 rounded-full bg-[#00dd55]/90 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="white"
              className="w-7 h-7 ml-1"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">
            Watch Now
          </span>
        </div>

        {/* Year badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span className="text-xs bg-black/70 text-gray-300 px-2 py-0.5 rounded">
            {movie.Year}
          </span>
          <span className="text-xs bg-black/70 text-gray-300 px-2 py-0.5 rounded capitalize">
            {movie.Type}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-[#1a1a1a]">
        <h3 className="text-white text-sm font-semibold truncate leading-snug">
          {movie.Title}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          <Star size={11} className="text-yellow-400 fill-yellow-400" />
          <span className="text-gray-400 text-xs">IMDb</span>
          {rating && (
            <span className="text-yellow-400 text-xs font-semibold">
              {rating}
            </span>
          )}
          <span className="text-gray-500 text-xs ml-auto">{movie.Year}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="movie-card">
      <div className="aspect-[2/3] skeleton-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 skeleton-pulse rounded w-3/4" />
        <div className="h-3 skeleton-pulse rounded w-1/2" />
      </div>
    </div>
  );
}
