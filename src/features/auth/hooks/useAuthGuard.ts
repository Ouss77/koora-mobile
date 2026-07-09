import { useSession } from "./useSession";

export function useAuthDestination() {
  const { data: session, isLoading } = useSession();
  const destination = session ? "/home" : "/login";
  return { isLoading, destination } as const;
}

type GuardMode = "requireAuth" | "requireGuest";

export function useAuthGuard(mode: GuardMode) {
  const { isLoading, destination } = useAuthDestination();

  const shouldRedirect =
    !isLoading &&
    (mode === "requireAuth" ? destination !== "/home" : destination !== "/login");

  return { isLoading, shouldRedirect, redirectTo: destination };
}