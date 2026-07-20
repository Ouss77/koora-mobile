import { RankingUser } from "../types/ranking-user";

/** La ligne telle que la fonction SQL get_ranking() la renvoie : snake_case. */
export interface RankingRow {
  user_id: string;
  username: string;
  points: number;
  matches_played: number;
  correct_predictions: number;
  accuracy: number;
  rank: number;
}

/** Sens lecture uniquement : base -> app. Le classement ne s'écrit jamais. */
export function toRankingUser(row: RankingRow): RankingUser {
  return {
    id: row.user_id,
    username: row.username,
    points: row.points,
    rank: row.rank,
    matchesPlayed: row.matches_played,
    correctPredictions: row.correct_predictions,
    accuracy: row.accuracy,
  };
}