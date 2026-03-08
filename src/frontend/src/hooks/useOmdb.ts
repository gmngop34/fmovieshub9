import { useQuery } from "@tanstack/react-query";
import type { OmdbDetail, OmdbSearchResult } from "../types/movie";

const OMDB_KEY = "986f8163";
const OMDB_BASE = "https://www.omdbapi.com/";

export async function searchOmdb(
  query: string,
  type?: string,
  page = 1,
): Promise<OmdbSearchResult> {
  const params = new URLSearchParams({
    s: query,
    apikey: OMDB_KEY,
    page: String(page),
  });
  if (type) params.set("type", type);
  const res = await fetch(`${OMDB_BASE}?${params}`);
  return res.json();
}

export async function fetchOmdbDetail(imdbId: string): Promise<OmdbDetail> {
  const params = new URLSearchParams({
    i: imdbId,
    apikey: OMDB_KEY,
    plot: "full",
  });
  const res = await fetch(`${OMDB_BASE}?${params}`);
  return res.json();
}

export function useOmdbSearch(query: string, type?: string, page = 1) {
  return useQuery<OmdbSearchResult>({
    queryKey: ["omdb-search", query, type, page],
    queryFn: () => searchOmdb(query, type, page),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOmdbDetail(imdbId: string) {
  return useQuery<OmdbDetail>({
    queryKey: ["omdb-detail", imdbId],
    queryFn: () => fetchOmdbDetail(imdbId),
    enabled: !!imdbId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useOmdbRating(imdbId: string) {
  return useQuery<string | null>({
    queryKey: ["omdb-rating", imdbId],
    queryFn: async () => {
      const data = await fetchOmdbDetail(imdbId);
      if (data.Response === "True" && data.imdbRating !== "N/A") {
        return data.imdbRating;
      }
      return null;
    },
    enabled: !!imdbId,
    staleTime: 30 * 60 * 1000,
  });
}
