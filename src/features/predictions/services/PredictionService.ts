import { IMatchRepository } from "@/features/matches/repositories/IMatchRepository";
import { Match } from "@/features/matches/types/match";
import { MatchResult } from "@/features/matches/types/match-result";
import { MatchStatus } from "@/features/matches/types/match-status";

import { IPredictionRepository } from "../repositories/IPredictionRepository";
import { Prediction, PredictionInput } from "../types/prediction";
import {
  MatchFinishedError,
  MatchNotFoundError,
  PredictionLockedError,
} from "../errors/prediction.errors";

/** Une selection faite dans l'UI, avant validation metier. */
export interface PredictionSelection {
  matchId: string;
  prediction: MatchResult;
}

export class PredictionService {
  constructor(
    private readonly predictionRepository: IPredictionRepository,
    private readonly matchRepository: IMatchRepository,
  ) {}

  /**
   * Coeur du verrouillage. Fonction pure : elle ne fait aucun appel reseau,
   * elle decide a partir d'un Match deja charge.
   *
   * Ordre des controles volontaire : un match termine a forcement un kickoff
   * passe. Si on testait le kickoff en premier, on ne leverait JAMAIS
   * MatchFinishedError et l'utilisateur verrait toujours "match verrouille",
   * meme sur un match dont le resultat est publie.
   */
  private assertOpen(match: Match | undefined, matchId: string): void {
    if (!match) {
      throw new MatchNotFoundError(matchId);
    }

    if (match.status === MatchStatus.FINISHED) {
      throw new MatchFinishedError(matchId);
    }

    // La verite du verrou, c'est kickoff_at -- jamais `status`.
    // Rien ne fait passer status de upcoming a locked en base (pas de cron
    // en V1), donc un match d'hier soir est encore "upcoming". Cf. dette Issue 5.
    if (new Date() >= new Date(match.kickoffAt)) {
      throw new PredictionLockedError(matchId);
    }
  }

  async getUserPredictions(userId: string): Promise<Prediction[]> {
    return this.predictionRepository.listByUser(userId);
  }

  /** Cree ou met a jour un pronostic. Le upsert gere les deux cas (CdC 3.3). */
  async savePrediction(
    userId: string,
    matchId: string,
    prediction: MatchResult,
  ): Promise<Prediction> {
    const match = await this.matchRepository.findById(matchId);
    this.assertOpen(match ?? undefined, matchId);

    return this.predictionRepository.upsert({ userId, matchId, prediction });
  }

  /**
   * Bouton "Valider mes pronostics" (CdC 3.5).
   *
   * Une seule requete pour lire les matchs, au lieu d'un findById par selection.
   * Puis TOUT est valide avant la moindre ecriture : si un seul match est
   * verrouille, rien n'est enregistre. Un enregistrement partiel serait
   * incomprehensible pour l'utilisateur.
   */
  async savePredictions(
    userId: string,
    selections: PredictionSelection[],
  ): Promise<Prediction[]> {
    if (selections.length === 0) {
      return [];
    }

    const matches = await this.matchRepository.list();
    const matchById = new Map(matches.map((m) => [m.id, m]));

    for (const selection of selections) {
      this.assertOpen(matchById.get(selection.matchId), selection.matchId);
    }

    const inputs: PredictionInput[] = selections.map((selection) => ({
      userId,
      matchId: selection.matchId,
      prediction: selection.prediction,
    }));

    return this.predictionRepository.upsertMany(inputs);
  }

  /** Suppression interdite apres le coup d'envoi (CdC 3.4). */
  async deletePrediction(userId: string, matchId: string): Promise<void> {
    const match = await this.matchRepository.findById(matchId);
    this.assertOpen(match ?? undefined, matchId);

    return this.predictionRepository.deleteByMatch(userId, matchId);
  }
}