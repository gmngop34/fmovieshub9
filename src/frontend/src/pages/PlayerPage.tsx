import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  Clock,
  Film,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { MovieCard, MovieCardSkeleton } from "../components/MovieCard";
import { fetchOmdbDetail, searchOmdb } from "../hooks/useOmdb";
import type { OmdbDetail, OmdbMovie } from "../types/movie";

type ServerKey = 1 | 2 | 3;

const SERVERS = [
  { id: 1 as ServerKey, label: "Server 1" },
  { id: 2 as ServerKey, label: "Server 2" },
  { id: 3 as ServerKey, label: "Server 3" },
];

function getEmbedUrl(
  server: ServerKey,
  imdbId: string,
  type: string,
  season: number,
  episode: number,
): string {
  const isSeries = type === "series";
  switch (server) {
    case 1:
      if (isSeries) {
        return `https://www.2embed.cc/embedtv/${imdbId}&s=${season}&e=${episode}`;
      }
      return `https://www.2embed.cc/embed/${imdbId}`;
    case 2:
      if (isSeries) {
        return `https://vidfast.pro/tv/${imdbId}/${season}/${episode}`;
      }
      return `https://vidfast.pro/movie/${imdbId}`;
    case 3:
      if (isSeries) {
        return `https://vidlink.pro/tv/${imdbId}/${season}/${episode}`;
      }
      return `https://vidlink.pro/movie/${imdbId}`;
    default:
      return "";
  }
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i + 1);
}

export function PlayerPage() {
  const { imdbId } = useParams({ from: "/player/$imdbId" });
  const navigate = useNavigate();

  const [detail, setDetail] = useState<OmdbDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [server, setServer] = useState<ServerKey>(1);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [suggestions, setSuggestions] = useState<OmdbMovie[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSeason(1);
    setEpisode(1);
    setServer(1);

    fetchOmdbDetail(imdbId).then((data) => {
      if (data.Response === "False") {
        setError(data.Error ?? "Movie not found");
        setLoading(false);
        return;
      }
      setDetail(data);
      setLoading(false);

      // Load suggestions based on genre or title
      setSuggestionsLoading(true);
      const genre = data.Genre?.split(",")[0]?.trim() ?? "action";
      searchOmdb(genre, data.Type === "series" ? "series" : "movie").then(
        (r) => {
          if (r.Search) {
            setSuggestions(
              r.Search.filter((m) => m.imdbID !== imdbId).slice(0, 8),
            );
          }
          setSuggestionsLoading(false);
        },
      );
    });
  }, [imdbId]);

  const totalSeasons = detail?.totalSeasons
    ? Number.parseInt(detail.totalSeasons, 10)
    : 1;
  const isSeries = detail?.Type === "series";

  const embedUrl = detail
    ? getEmbedUrl(server, imdbId, detail.Type, season, episode)
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] pt-28 px-4 md:px-8 lg:px-16 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="aspect-video skeleton-pulse rounded-xl mb-6" />
          <div className="space-y-3">
            <div className="h-8 skeleton-pulse rounded w-2/3" />
            <div className="h-4 skeleton-pulse rounded w-1/2" />
            <div className="h-16 skeleton-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div
        data-ocid="player.error_state"
        className="min-h-screen bg-[#141414] pt-28 flex items-center justify-center"
      >
        <div className="text-center space-y-4">
          <AlertCircle size={56} className="text-red-400 mx-auto" />
          <h2 className="text-white text-xl font-semibold">
            {error ?? "Something went wrong"}
          </h2>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 mx-auto px-6 py-2 bg-[#00dd55] text-black font-bold rounded-lg"
          >
            <ChevronLeft size={18} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        {/* Video Player */}
        <div className="player-iframe-wrapper shadow-2xl mb-4">
          <iframe
            src={embedUrl}
            title={detail.Title}
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          />
        </div>

        {/* Server Selector (below player) */}
        <div className="flex flex-wrap gap-2 mb-3">
          {SERVERS.map((s) => (
            <button
              key={s.id}
              type="button"
              data-ocid={`player.server_button.${s.id}`}
              onClick={() => setServer(s.id)}
              className={`server-btn ${server === s.id ? "active" : ""}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Season & Episode Selector (for series, below player) */}
        {isSeries && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-wrap gap-3 mb-4 items-center"
          >
            <div className="flex items-center gap-2">
              <label
                htmlFor="season-select"
                className="text-gray-400 text-sm font-medium"
              >
                Season:
              </label>
              <select
                id="season-select"
                data-ocid="player.season_select"
                value={season}
                onChange={(e) => {
                  setSeason(Number(e.target.value));
                  setEpisode(1);
                }}
                className="bg-[#1a1a1a] border border-white/20 text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-[#00dd55] cursor-pointer"
              >
                {range(
                  Number.isNaN(totalSeasons) || totalSeasons < 1
                    ? 5
                    : totalSeasons,
                ).map((s) => (
                  <option key={s} value={s}>
                    Season {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="episode-select"
                className="text-gray-400 text-sm font-medium"
              >
                Episode:
              </label>
              <select
                id="episode-select"
                data-ocid="player.episode_select"
                value={episode}
                onChange={(e) => setEpisode(Number(e.target.value))}
                className="bg-[#1a1a1a] border border-white/20 text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-[#00dd55] cursor-pointer"
              >
                {range(30).map((ep) => (
                  <option key={ep} value={ep}>
                    Episode {ep}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        {/* Movie Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-10"
        >
          <h1 className="text-2xl md:text-4xl font-display font-bold text-white">
            {detail.Title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-300">
              <Calendar size={14} className="text-[#00dd55]" />
              <span>
                {detail.Released !== "N/A" ? detail.Released : detail.Year}
              </span>
            </div>
            {detail.Runtime !== "N/A" && (
              <div className="flex items-center gap-1.5 text-gray-300">
                <Clock size={14} className="text-[#00dd55]" />
                <span>{detail.Runtime}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-gray-300">
              <Film size={14} className="text-[#00dd55]" />
              <span className="capitalize">{detail.Type}</span>
            </div>
            {detail.imdbRating !== "N/A" && (
              <div className="flex items-center gap-1.5">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400 font-semibold">
                  {detail.imdbRating}
                </span>
                <span className="text-gray-500">/10</span>
              </div>
            )}
          </div>

          {/* Genre tags */}
          {detail.Genre && detail.Genre !== "N/A" && (
            <div className="flex flex-wrap gap-2">
              {detail.Genre.split(",").map((g) => (
                <span
                  key={g.trim()}
                  className="px-3 py-0.5 rounded-full text-xs bg-white/10 text-gray-300 border border-white/10"
                >
                  {g.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Plot */}
          {detail.Plot && detail.Plot !== "N/A" && (
            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-4xl">
              {detail.Plot}
            </p>
          )}

          {/* Cast / Director */}
          <div className="flex flex-col gap-1.5 text-sm">
            {detail.Director && detail.Director !== "N/A" && (
              <p className="text-gray-400">
                <span className="text-gray-500">Director: </span>
                <span className="text-gray-300">{detail.Director}</span>
              </p>
            )}
            {detail.Actors && detail.Actors !== "N/A" && (
              <p className="text-gray-400">
                <span className="text-gray-500">Cast: </span>
                <span className="text-gray-300">{detail.Actors}</span>
              </p>
            )}
          </div>
        </motion.div>

        {/* Suggestions */}
        <section>
          <h2 className="text-white text-xl md:text-2xl font-display font-bold mb-5">
            You May Also Like
          </h2>
          {suggestionsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton count
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-gray-500 text-sm">No suggestions available</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {suggestions.map((movie, i) => (
                <MovieCard key={movie.imdbID} movie={movie} index={i} />
              ))}
            </div>
          )}
        </section>

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
    </div>
  );
}
