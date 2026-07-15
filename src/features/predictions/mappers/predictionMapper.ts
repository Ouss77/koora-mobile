import { MatchResult } from "@/features/matches/types/match-result";
import { Prediction, PredictionInput } from "../types/prediction";

/** La ligne telle que Postgres la renvoie : snake_case. */
export interface PredictionRow {
  id: string;
  user_id: string;
  match_id: string;
  prediction: MatchResult;
  points_awarded: number;
  created_at: string;
}

/** Sens lecture : base -> app. */
export function toPrediction(row: PredictionRow): Prediction {
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    prediction: row.prediction,
    pointsAwarded: row.points_awarded,
    createdAt: row.created_at,
  };
}

/**
 * Sens écriture : app -> base.
 * Pas de points_awarded : les points sont calculés serveur à la clôture
 * du match (CdC 4.4). Si le client les envoyait, chaque modification de
 * pronostic les remettrait à zéro.
 */
export function toPredictionRow(input: PredictionInput) {
  return {
    user_id: input.userId,
    match_id: input.matchId,
    prediction: input.prediction,
  };
}