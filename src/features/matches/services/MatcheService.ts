import { IMatchRepository } from "../repositories/IMatchRepository";
import { Match } from "../types/match";

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