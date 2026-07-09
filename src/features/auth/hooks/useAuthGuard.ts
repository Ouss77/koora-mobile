import { useSession } from "./useSession";

type GuardMode = "requireAuth" | "requireGuest";

export function useAuthGuard(mode: GuardMode) {
  const { data: session, isLoading } = useSession();

  const shouldRedirect = !isLoading && (mode === "requireAuth" ? !session : !!session);
  const redirectTo = mode === "requireAuth" ? "/login" : "/home";

  return { isLoading, shouldRedirect, redirectTo };
}