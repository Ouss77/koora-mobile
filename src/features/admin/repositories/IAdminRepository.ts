// features/admin/repositories/IAdminRepository.ts
import type {
  MatchPayload,
  MatchResultValue,
  RawAdminMatchRow,
} from "../types/admin.types";

export interface IAdminRepository {
  /** Tous les matchs avec leur compteur de pronostics (lignes brutes). */
  getAllMatches(): Promise<RawAdminMatchRow[]>;

  createMatch(payload: MatchPayload): Promise<void>;

  updateMatch(matchId: string, payload: MatchPayload): Promise<void>;

  deleteMatch(matchId: string): Promise<void>;

  /** Saisie ET correction : même RPC atomique côté PostgreSQL. */
  setResult(matchId: string, result: MatchResultValue): Promise<void>;
}