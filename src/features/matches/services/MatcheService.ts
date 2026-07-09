import { Match } from "../types/match";
import { IMatchRepository } from "../repositories/IMatchRepository";

export class MatchService {
  constructor(private readonly repository: IMatchRepository) {}

  async getMatches(): Promise<Match[]> {
    return this.repository.list();
  }

  async getUpcomingMatches(): Promise<Match[]> {
    return this.repository.listUpcoming();
  }

  async getLockedMatches(): Promise<Match[]> {
    return this.repository.listLocked();
  }

  async getFinishedMatches(): Promise<Match[]> {
    return this.repository.listFinished();
  }
}