import { Prediction, PredictionInput } from "../types/prediction";

/**
 * Contrat d'accès aux données des pronostics.
 */
export interface IPredictionRepository {
  /** Tous les pronostics d'un utilisateur. Tableau vide si aucun. */
  listByUser(userId: string): Promise<Prediction[]>;

  upsert(input: PredictionInput): Promise<Prediction>;


  upsertMany(inputs: PredictionInput[]): Promise<Prediction[]>;

  deleteByMatch(userId: string, matchId: string): Promise<void>;
}