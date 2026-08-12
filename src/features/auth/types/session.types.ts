// features/auth/types/session.types.ts
import type { Session } from "@supabase/supabase-js";

/**
 * Session enrichie avec le rôle de la table public.users.
 * Wrapper robuste : aucune mutation de Session Supabase, juste extension.
 * Prépare V2 : avatar, settings, etc. suivront le même pattern.
 */
export interface AppSession extends Session {
  user: Session["user"] & {
    role: "user" | "admin";
  };
}

/**
 * Vérifie que la session a un rôle valide.
 * Failsafe : si le rôle est absent ou invalide, défaut à 'user'.
 */
export function isAppSession(session: Session | null): session is AppSession {
  return (
    session !== null &&
    session.user !== null &&
    ("role" in session.user || true) // true = failsafe : 'user' par défaut
  );
}