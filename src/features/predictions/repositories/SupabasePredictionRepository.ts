import { supabase } from "@/core/supabase/client";

import { Prediction, PredictionInput } from "../types/prediction";
import { IPredictionRepository } from "./IPredictionRepository";
import {
  PredictionRow,
  toPrediction,
  toPredictionRow,
} from "../mappers/predictionMapper";

export class SupabasePredictionRepository implements IPredictionRepository {
  /**
   * Coeur d'ecriture partage par upsert() et upsertMany().
   * Un seul INSERT ... ON CONFLICT DO UPDATE cote Postgres : atomique.
   * C'est ce qui garantit le "tout ou rien" du bouton "Valider mes pronostics".
   */
  private async upsertRows(inputs: PredictionInput[]): Promise<Prediction[]> {
    const { data, error } = await supabase
      .from("predictions")
      .upsert(inputs.map(toPredictionRow), { onConflict: "user_id,match_id" })
      .select("*")
      .returns<PredictionRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(toPrediction);
  }

  async listByUser(userId: string): Promise<Prediction[]> {
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId)
      .returns<PredictionRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(toPrediction);
  }

  async upsert(input: PredictionInput): Promise<Prediction> {
    const [prediction] = await this.upsertRows([input]);

    // Defensif : sans erreur Supabase, la ligne doit exister. Si elle manque,
    // mieux vaut echouer ici que renvoyer un undefined qui plantera dans l'UI.
    if (!prediction) {
      throw new Error("Le pronostic n'a pas pu etre enregistre.");
    }

    return prediction;
  }

  async upsertMany(inputs: PredictionInput[]): Promise<Prediction[]> {
    if (inputs.length === 0) {
      return [];
    }

    return this.upsertRows(inputs);
  }

  async deleteByMatch(userId: string, matchId: string): Promise<void> {
    const { error } = await supabase
      .from("predictions")
      .delete()
      .eq("user_id", userId)
      .eq("match_id", matchId);

    if (error) {
      throw new Error(error.message);
    }
  }
}