import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetFeaturedIds() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["featured-ids"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedIds();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetQualityLabel(imdbId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["quality-label", imdbId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getQualityLabel(imdbId);
    },
    enabled: !!actor && !isFetching && !!imdbId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGetContactInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["contact-info"],
    queryFn: async () => {
      if (!actor) return "Contact us at: support@freemovieshub.com";
      return actor.getContactInfo();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30 * 60 * 1000,
  });
}
