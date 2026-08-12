// features/admin/hooks/useAdminMatches.ts
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import type { AdminMatch } from "../types/admin.types";

/**
 * Matchs visibles par l'admin : tous, avec compteur de pronostics.
 * Clé ['admin','matches'] : invalidée après CRUD ou résultat.
 */
export function useAdminMatches() {
  return useQuery<AdminMatch[]>({
    queryKey: ["admin", "matches"],
    queryFn: () => adminService.getMatches(),
    staleTime: 30 * 1000, // 30s : les matchs changent rarement
    refetchOnWindowFocus: true,
  });
}