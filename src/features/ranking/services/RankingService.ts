import { IRankingRepository } from "../repositories/IRankingRepository";
import { RankingUser } from "../types/ranking-user";

export class RankingService {
  constructor(private readonly repository: IRankingRepository) {}

  getRanking(): Promise<RankingUser[]> {
    return this.repository.getRanking();
  }

  getMyRank(): Promise<RankingUser | null> {
    return this.repository.getCurrentUserRank();
  }
}