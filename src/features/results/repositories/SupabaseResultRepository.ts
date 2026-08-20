// features/results/repositories/SupabaseResultRepository.ts
import { supabase } from '../../../core/supabase/client'; // même import que SupabaseProfileRepository — ajuste si le chemin diffère
import type { IResultRepository } from './IResultRepository';
import type { RawResultRow } from '../types/result.types';

export class SupabaseResultRepository implements IResultRepository {
  async getMyFinishedPredictions(): Promise<RawResultRow[]> {

    const { data, error } = await supabase
      .from('predictions')
      .select(
        `
        id,
        prediction,
        points_awarded,
        matches!inner (
          id,
          team1,
          team2,
          kickoff_at,
          result
        )
      `,
      )
      .eq('matches.status', 'finished');

    if (error) {
      throw new Error(`Erreur lors de la récupération des résultats : ${error.message}`);
    }

    const rows = (data ?? []) as unknown as RawResultRow[];
    const teamNames = [...new Set(rows.flatMap((row) => [row.matches.team1, row.matches.team2]))];

    if (teamNames.length === 0) return rows;

    const { data: teams } = await supabase
      .from("teams")
      .select("name, logo_url")
      .in("name", teamNames);
    const logosByName = new Map(
      (teams ?? []).map((team) => [team.name.toLowerCase(), team.logo_url as string | null]),
    );

    return rows.map((row) => ({
      ...row,
      matches: {
        ...row.matches,
        team1_logo: logosByName.get(row.matches.team1.toLowerCase()) ?? null,
        team2_logo: logosByName.get(row.matches.team2.toLowerCase()) ?? null,
      },
    }));
  }
}

export const resultRepository: IResultRepository = new SupabaseResultRepository();
