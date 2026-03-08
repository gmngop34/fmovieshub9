export interface OmdbMovie {
  imdbID: string;
  Title: string;
  Year: string;
  Type: "movie" | "series" | "episode";
  Poster: string;
}

export interface OmdbSearchResult {
  Search?: OmdbMovie[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

export interface OmdbDetail {
  imdbID: string;
  Title: string;
  Year: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Actors: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  Type: "movie" | "series" | "episode";
  totalSeasons?: string;
  Response: string;
  Error?: string;
}

export type QualityLabel = "BluRay" | "WebRip" | "HDTC" | "HDRip" | "WEB-DL";

export const QUALITY_LABELS: QualityLabel[] = [
  "BluRay",
  "WebRip",
  "HDTC",
  "HDRip",
  "WEB-DL",
];

export function getQualityClass(quality: string): string {
  switch (quality.toLowerCase()) {
    case "bluray":
      return "badge-bluray";
    case "webrip":
      return "badge-webrip";
    case "hdtc":
      return "badge-hdtc";
    case "hdrip":
      return "badge-hdrip";
    case "web-dl":
      return "badge-webdl";
    default:
      return "badge-webdl";
  }
}

export function assignRandomQuality(imdbId: string): QualityLabel {
  const idx =
    imdbId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    QUALITY_LABELS.length;
  return QUALITY_LABELS[idx];
}
