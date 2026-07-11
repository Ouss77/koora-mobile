import { Match } from "../types/match";

export interface IMatchRepository {
  list(): Promise<Match[]>;

  listUpcoming(): Promise<Match[]>;

  listLocked(): Promise<Match[]>;

  listFinished(): Promise<Match[]>;
}