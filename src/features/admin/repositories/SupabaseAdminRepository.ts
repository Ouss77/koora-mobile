// features/admin/repositories/SupabaseAdminRepository.ts
import { supabase } from "../../../core/supabase/client"; // même import que les autres repositories — ajuste si besoin
import type { IAdminRepository } from "./IAdminRepository";
import type {
  MatchPayload,
  MatchResultValue,
  RawAdminMatchRow,
} from "../types/admin.types";

export class SupabaseAdminRepository implements IAdminRepository {
  async getAllMatches(): Promise<RawAdminMatchRow[]> {
    // predictions(count) : agrégat embarqué — nécessite la policy
    // « Admins can read all predictions » (migration 002) pour que
    // le compteur reflète TOUS les pronostics, pas ceux de l'admin.
    const { data, error } = await supabase
      .from("matches")
      .select("id, team1, team2, kickoff_at, result, predictions(count)")
      .order("kickoff_at", { ascending: false });

    if (error) {
      throw new Error(`Erreur lors du chargement des matchs : ${error.message}`);
    }
    return (data ?? []) as unknown as RawAdminMatchRow[];
  }

  async createMatch(payload: MatchPayload): Promise<void> {
    const { error } = await supabase.from("matches").insert({
      team1: payload.team1,
      team2: payload.team2,
      kickoff_at: payload.kickoffAt.toISOString(),
    });
    if (error) {
      throw new Error(`Création impossible : ${error.message}`);
    }
  }

  async updateMatch(matchId: string, payload: MatchPayload): Promise<void> {
    const { error } = await supabase
      .from("matches")
      .update({
        team1: payload.team1,
        team2: payload.team2,
        kickoff_at: payload.kickoffAt.toISOString(),
      })
      .eq("id", matchId);
    if (error) {
      // Peut venir du trigger « Match verrouillé » si le service a été
      // contourné — le message SQL est déjà en français, on le relaie.
      throw new Error(error.message);
    }
  }

  async deleteMatch(matchId: string): Promise<void> {
    // .select() pour détecter le refus SILENCIEUX de la policy
    // (RLS sur DELETE = 0 ligne, pas d'erreur) : sans ce contrôle,
    // un contournement du service passerait pour un succès.
    const { data, error } = await supabase
      .from("matches")
      .delete()
      .eq("id", matchId)
      .select("id");

    if (error) {
      throw new Error(`Suppression impossible : ${error.message}`);
    }
    if (!data || data.length === 0) {
      throw new Error(
        "Suppression refusée : ce match a des pronostics ou n'existe plus",
      );
    }
  }

  async setResult(matchId: string, result: MatchResultValue): Promise<void> {
    const { error } = await supabase.rpc("set_match_result", {
      p_match_id: matchId,
      p_result: result,
    });
    if (error) {
      throw new Error(error.message);
    }
  }
}

export const adminRepository: IAdminRepository = new SupabaseAdminRepository();