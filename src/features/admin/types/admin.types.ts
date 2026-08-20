// features/admin/types/admin.types.ts
import type { MatchResultValue } from "@/features/results/types/result.types";

export type { MatchResultValue };

/**
 * Statut d'AFFICHAGE, toujours dérivé (règle du sprint) :
 * finished si résultat, sinon locked si coup d'envoi passé, sinon upcoming.
 * La colonne `status` en base n'est écrite que par set_match_result.
 */
export type DerivedMatchStatus = "upcoming" | "locked" | "finished";

/** Un match vu par l'administrateur. */
export interface AdminMatch {
  id: string;
  team1: string;
  team2: string;
  team1Logo?: string;
  team2Logo?: string;
  kickoffAt: Date;
  result: MatchResultValue | null;
  status: DerivedMatchStatus;
  predictionsCount: number;
}

export interface MatchPayload {
  team1: string;
  team2: string;
  kickoffAt: Date;
}

/** Ligne brute Supabase (repository → mapper). */
export interface RawAdminMatchRow {
  id: string;
  team1: string;
  team2: string;
  kickoff_at: string;
  result: MatchResultValue | null;
  predictions: { count: number }[];
  team1_logo?: string | null;
  team2_logo?: string | null;
}
