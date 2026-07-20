import { useQuery } from "@tanstack/react-query";

import { SupabaseRankingRepository } from "../repositories/SupabaseRankingRepository";
import { RankingService } from "../services/RankingService";

const repository = new SupabaseRankingRepository();
const service = new RankingService(repository);

export function useRanking() {
  return useQuery({
    queryKey: ["ranking"],
    queryFn: () => service.getRanking(),
  });
}