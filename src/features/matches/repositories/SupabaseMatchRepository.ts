import { Match } from "../types/match";
import { IMatchRepository } from "./IMatchRepository";

export class SupabaseMatchRepository implements IMatchRepository {
  async list(): Promise<Match[]> {
    throw new Error("Method not implemented.");
  }

  async listUpcoming(): Promise<Match[]> {
    throw new Error("Method not implemented.");
  }

  async listLocked(): Promise<Match[]> {
    throw new Error("Method not implemented.");
  }

  async listFinished(): Promise<Match[]> {
    throw new Error("Method not implemented.");
  }
}