// features/admin/services/adminService.ts
import { adminRepository } from "../repositories/SupabaseAdminRepository";
import type { IAdminRepository } from "../repositories/IAdminRepository";
import { mapRawRowToAdminMatch } from "../mappers/adminMatchMapper";
import type {
  AdminMatch,
  MatchPayload,
  MatchResultValue,
} from "../types/admin.types";

/**
 * Règles métier admin (CdC §4.1–§4.4).
 * Première ligne de défense : messages clairs AVANT le refus base.
 * PostgreSQL (policies + trigger + RPC) reste la vraie protection.
 *
 * resetUserPassword : volontairement absent — via Dashboard Supabase
 * en V1 (décision epic Sprint 8), Edge Function en V2.
 */
class AdminService {
  constructor(private readonly repository: IAdminRepository) {}

  async getMatches(): Promise<AdminMatch[]> {
    const rows = await this.repository.getAllMatches();
    return rows.map(mapRawRowToAdminMatch);
  }

  /** CdC §4.2 : équipes/date modifiables uniquement sans pronostic. */
  canEditMatch(match: AdminMatch): boolean {
    return match.predictionsCount === 0;
  }

  /** CdC §4.3 : suppression uniquement sans pronostic. */
  canDeleteMatch(match: AdminMatch): boolean {
    return match.predictionsCount === 0;
  }

  /** Résultat saisissable dès le coup d'envoi passé (locked ou finished). */
  canSetResult(match: AdminMatch): boolean {
    return match.status !== "upcoming";
  }

  async createMatch(payload: MatchPayload): Promise<void> {
    // La validation de forme (équipes, date future) est faite par Zod
    // dans le formulaire ; la base la revérifie (policy + check).
    await this.repository.createMatch(payload);
  }

  async updateMatch(match: AdminMatch, payload: MatchPayload): Promise<void> {
    if (!this.canEditMatch(match)) {
      throw new Error(
        `Modification impossible : ${match.predictionsCount} pronostic(s) enregistré(s) sur ce match. Seul le résultat peut être saisi ou corrigé.`,
      );
    }
    await this.repository.updateMatch(match.id, payload);
  }

  async deleteMatch(match: AdminMatch): Promise<void> {
    if (!this.canDeleteMatch(match)) {
      throw new Error(
        `Suppression impossible : ${match.predictionsCount} pronostic(s) enregistré(s) sur ce match.`,
      );
    }
    await this.repository.deleteMatch(match.id);
  }

  /** Saisie ET correction : même appel, la RPC recalcule tout. */
  async setResult(
    match: AdminMatch,
    result: MatchResultValue,
  ): Promise<void> {
    if (!this.canSetResult(match)) {
      throw new Error(
        "Impossible de saisir un résultat : le match n'a pas encore commencé.",
      );
    }
    await this.repository.setResult(match.id, result);
  }
}

export const adminService = new AdminService(adminRepository);