import { RankingUser } from "../types/ranking-user";

export interface IRankingRepository {
  getRanking(): Promise<RankingUser[]>;
  getCurrentUserRank(): Promise<RankingUser | null>;
}