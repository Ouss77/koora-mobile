// features/results/services/resultService.ts
import { resultRepository } from '../repositories/SupabaseResultRepository';
import type { IResultRepository } from '../repositories/IResultRepository';
import { mapRawRowToMyResult } from '../mappers/resultMapper';
import type { MyResult } from '../types/result.types';

class ResultService {
  constructor(private readonly repository: IResultRepository) {}

  async getMyResults(): Promise<MyResult[]> {
    const rows = await this.repository.getMyFinishedPredictions();

    return (
      rows
        .map(mapRawRowToMyResult)
        .sort((a, b) => b.match.kickoffAt.getTime() - a.match.kickoffAt.getTime())
    );
  }
}

export const resultService = new ResultService(resultRepository);