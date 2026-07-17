import { useQuery } from "@tanstack/react-query";

import { Prediction } from "../types/prediction";
import { predictionsQueryOptions } from "./usepredictions";

/**
 * Le pronostic de l'utilisateur sur UN match, ou null.
 *
 * Aucune requete reseau supplementaire : meme queryKey que usePredictions,
 * donc meme entree de cache. `select` ne fait que filtrer le tableau deja
 * charge. C'est ce qui justifie la suppression de getPredictionByMatch
 * du Repository a l'Issue 1.
 */
export function usePrediction(userId: string | undefined, matchId: string) {
  return useQuery({
    ...predictionsQueryOptions(userId),
    select: (predictions: Prediction[]) =>
      predictions.find((p) => p.matchId === matchId) ?? null,
  });
}
 