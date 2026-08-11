// features/results/repositories/IResultRepository.ts
import type { RawResultRow } from '../types/result.types';

export interface IResultRepository {
  getMyFinishedPredictions(): Promise<RawResultRow[]>;
}