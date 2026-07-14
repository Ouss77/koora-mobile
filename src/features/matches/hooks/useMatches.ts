import { useQuery } from "@tanstack/react-query";

import { SupabaseMatchRepository } from "../repositories/SupabaseMatchRepository";
import { MatchService } from "../services/MatcheService";

const repository = new SupabaseMatchRepository();
const service = new MatchService(repository);

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: () => service.getMatches(),
  });
}
