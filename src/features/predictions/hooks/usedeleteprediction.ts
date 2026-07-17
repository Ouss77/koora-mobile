import { useMutation, useQueryClient } from "@tanstack/react-query";

import { predictionService } from "../services/predictionService";

/**
 * Aucun ecran du CdC n'appelle ceci pour l'instant (cf. discussion Issue 1).
 * Le hook existe pour que l'interface soit complete cote UI le jour ou un
 * ecran en aura besoin.
 */
export function useDeletePrediction(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) =>
      predictionService.deletePrediction(userId!, matchId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
