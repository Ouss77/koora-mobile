import { MatchResult } from "@/features/matches/types/match-result";

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  prediction: MatchResult;
  pointsAwarded: number;
  createdAt: string;
}

/** Sans id, pointsAwarded ni createdAt : champs serveur, le client ne les fournit pas. */
export interface PredictionInput {
  userId: string;
  matchId: string;
  prediction: MatchResult;
}