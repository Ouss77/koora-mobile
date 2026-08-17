// features/admin/hooks/useMatchMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import type { MatchPayload, AdminMatch } from "../types/admin.types";

export function useMatchMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: MatchPayload) => adminService.createMatch(payload),
    onSuccess: async () => {
      // Invalide les deux caches : admin et joueur
      await queryClient.invalidateQueries({ queryKey: ["admin", "matches"] });
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: { match: AdminMatch; payload: MatchPayload }) =>
      adminService.updateMatch(params.match, params.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "matches"] });
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (match: AdminMatch) => adminService.deleteMatch(match),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "matches"] });
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
}