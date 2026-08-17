// features/admin/hooks/useSetResult.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import type { AdminMatch, MatchResultValue } from "../types/admin.types";

export function useSetResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { match: AdminMatch; result: MatchResultValue }) =>
      adminService.setResult(params.match, params.result),
    onSuccess: async () => {
      // Invalidation complète : la RPC a changé le match ET tous les points liés
      // Les trois clés doivent se rafraîchir ensemble (TDD §7)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "matches"] }),
        queryClient.invalidateQueries({ queryKey: ["matches"] }),
        queryClient.invalidateQueries({ queryKey: ["ranking"] }),
        queryClient.invalidateQueries({ queryKey: ["results"] }),
      ]);
    },
  });
}
