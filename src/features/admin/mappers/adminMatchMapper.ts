// features/admin/mappers/adminMatchMapper.ts
import type {
  AdminMatch,
  DerivedMatchStatus,
  RawAdminMatchRow,
} from "../types/admin.types";

/**
 * Statut d'affichage dérivé (règle du sprint) : la colonne `status`
 * n'est jamais lue seule — un match passé sans résultat est `locked`
 * même si la base dit encore `upcoming` (rien ne la met à jour au
 * coup d'envoi en V1).
 */
export function deriveMatchStatus(
  result: RawAdminMatchRow["result"],
  kickoffAt: Date,
): DerivedMatchStatus {
  if (result !== null) return "finished";
  if (kickoffAt.getTime() <= Date.now()) return "locked";
  return "upcoming";
}

export function mapRawRowToAdminMatch(row: RawAdminMatchRow): AdminMatch {
  const kickoffAt = new Date(row.kickoff_at);
  return {
    id: row.id,
    team1: row.team1,
    team2: row.team2,
    team1Logo: row.team1_logo ?? undefined,
    team2Logo: row.team2_logo ?? undefined,
    kickoffAt,
    result: row.result,
    status: deriveMatchStatus(row.result, kickoffAt),
    predictionsCount: row.predictions?.[0]?.count ?? 0,
  };
}
