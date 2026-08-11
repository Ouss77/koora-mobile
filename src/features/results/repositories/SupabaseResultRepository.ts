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

    return (data ?? []) as unknown as RawResultRow[];
  }
}

export const resultRepository: IResultRepository = new SupabaseResultRepository();