import { IMatchRepository } from "@/features/matches/repositories/IMatchRepository";
import { SupabaseMatchRepository } from "@/features/matches/repositories/SupabaseMatchRepository";
import { Match } from "@/features/matches/types/match";
import { MatchResult } from "@/features/matches/types/match-result";
import { MatchStatus } from "@/features/matches/types/match-status";

import { IPredictionRepository } from "../repositories/IPredictionRepository";
import { SupabasePredictionRepository } from "../repositories/SupabasePredictionRepository";
import { Prediction, PredictionInput } from "../types/prediction";
import {  MatchFinishedError,  MatchNotFoundError,  PredictionLockedError,} from "../errors/prediction.errors";

export interface PredictionSelection {
  matchId: string;
  prediction: MatchResult;
}

function lockReason(match: Match): "finished" | "locked" | null {
  if (match.status === MatchStatus.FINISHED) return "finished";
  if (new Date() >= new Date(match.kickoffAt)) return "locked";
  return null;
}

// Pour l'écran : ouvert ou pas ? (un simple oui/non)
export function isMatchOpen(match: Match): boolean {
  return lockReason(match) === null;
}

export class PredictionService {
  constructor(
    private readonly predictionRepository: IPredictionRepository,
    private readonly matchRepository: IMatchRepository, 
  ) {}

  private assertOpen(match: Match | undefined, matchId: string): void {
    if (!match) throw new MatchNotFoundError(matchId);

    const reason = lockReason(match);
    if (reason === "finished") throw new MatchFinishedError(matchId);
    if (reason === "locked") throw new PredictionLockedError(matchId);
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

export const predictionService = new PredictionService(
  new SupabasePredictionRepository(),
  new SupabaseMatchRepository(),
);

