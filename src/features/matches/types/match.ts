import { MatchResult } from "./match-result";
import { MatchStatus } from "./match-status";

export interface Match {
  id: string;

  team1: string;

  team2: string;

  team1Logo?: string;

  team2Logo?: string;

  kickoffAt: string;

  status: MatchStatus;

  result: MatchResult | null;

  createdAt: string;
}
