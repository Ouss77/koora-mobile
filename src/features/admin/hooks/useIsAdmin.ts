// features/admin/hooks/useIsAdmin.ts
import { useSession } from "@/features/auth/hooks/useSession";

interface UseIsAdminResult {
  isAdmin: boolean;
  isLoading: boolean;
  error?: Error | null;
}

/**
 * Dérive isAdmin depuis ['session'] — aucune requête dupliquée.
 * TanStack selector : ne re-rend que si isAdmin change, pas si autres champs changent.
 */
export function useIsAdmin(): UseIsAdminResult {
  const { data: session, isLoading, error } = useSession();

  return {
    isAdmin: session?.user?.role === "admin",
    isLoading,
    error: error as Error | null | undefined,
  };
}

/**
 * Synchrone — pour les gardes de route : true si session chargée ET admin,
 * false sinon (y compris pendant le loading).
 * Utilise le cache TanStack sans re-fetch.
 */
export function useIsAdminSync(): boolean {
  const { data: session } = useSession();
  return session?.user?.role === "admin"
}
