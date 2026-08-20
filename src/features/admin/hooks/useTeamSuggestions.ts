import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/core/supabase/client";

export type Team = {
  id: string;
  name: string;
  logo_url: string | null;
  country: string | null;
  league: string | null;
};

export function useTeamSuggestions(searchQuery: string) {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const enabled = normalizedQuery.length >= 2;

  const query = useQuery({
    queryKey: ["teams", "search", normalizedQuery],
    enabled,
    staleTime: 0,
    queryFn: async (): Promise<Team[]> => {
      const { data, error } = await supabase
        .from("teams")
        .select("id, name, logo_url, country, league")
        .ilike("name", `%${normalizedQuery}%`)
        .limit(10);

      if (error) {
        throw new Error(`Recherche des équipes impossible : ${error.message}`);
      }

      return (data ?? []) as Team[];
    },
  });

  return {
    suggestions: enabled ? query.data ?? [] : [],
    isLoading: enabled && query.isLoading,
  };
}
