// features/results/mappers/resultMapper.ts
import type { MyResult, RawResultRow } from '../types/result.types';

export function mapRawRowToMyResult(row: RawResultRow): MyResult {
  return {
    id: row.id,
    match: {
      id: row.matches.id,
      team1: row.matches.team1,
      team2: row.matches.team2,
      team1Logo: row.matches.team1_logo ?? undefined,
      team2Logo: row.matches.team2_logo ?? undefined,
      kickoffAt: new Date(row.matches.kickoff_at),
    },
    prediction: row.prediction,
    actualResult: row.matches.result,
    pointsAwarded: row.points_awarded,
    // Règle du sprint : le statut se dérive de la comparaison des enums.
    // points_awarded (DEFAULT 0 en base) ne distingue pas « en attente »
    // de « perdant » et ne doit jamais servir ici.
    outcome: row.prediction === row.matches.result ? 'correct' : 'incorrect',
  };
}
