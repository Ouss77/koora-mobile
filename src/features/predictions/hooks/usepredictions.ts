import { useQuery } from "@tanstack/react-query";

import { predictionService } from "../services/PredictionService";

/**
 * Options partagees par usePredictions et usePrediction.
 * Meme queryKey = meme entree de cache = une seule requete reseau,
 * peu importe combien de composants les consomment.
 */
export function predictionsQueryOptions(userId: string | undefined) {
  return {
    queryKey: ["predictions", userId] as const,
    queryFn: () => predictionService.getUserPredictions(userId!),
    // Tant qu'il n'y a pas de session, on ne lance rien.
    enabled: !!userId,
  };
}

export function usePredictions(userId: string | undefined) {
  return useQuery(predictionsQueryOptions(userId));
}
