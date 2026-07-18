import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  PredictionSelection,
  predictionService,
} from "../services/PredictionService";

export function useSavePredictions(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (selections: PredictionSelection[]) =>
      predictionService.savePredictions(userId!, selections),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
