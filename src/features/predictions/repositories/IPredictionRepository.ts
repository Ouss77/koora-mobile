import { Prediction, PredictionInput } from "../types/prediction";

export interface IPredictionRepository {
  /** Tous les pronostics d'un utilisateur. Tableau vide si aucun. */
  listByUser(userId: string): Promise<Prediction[]>;

  upsert(input: PredictionInput): Promise<Prediction>;


  upsertMany(inputs: PredictionInput[]): Promise<Prediction[]>;

  deleteByMatch(userId: string, matchId: string): Promise<void>;
}