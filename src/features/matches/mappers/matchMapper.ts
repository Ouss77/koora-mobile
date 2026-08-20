import { Match } from "../types/match";
import { MatchResult } from "../types/match-result";
import { MatchStatus } from "../types/match-status";

export interface MatchRow {
  id: string;
  team1: string;
  team2: string;
  team1_logo?: string | null;
  team2_logo?: string | null;
  kickoff_at: string;
  status: MatchStatus;
  result: MatchResult | null;
  created_at: string;
}

export function toMatch(row: MatchRow): Match {
  return {
    id: row.id,
    team1: row.team1,
    team2: row.team2,
    team1Logo: row.team1_logo ?? undefined,
    team2Logo: row.team2_logo ?? undefined,
    kickoffAt: row.kickoff_at,
    status: row.status,
    result: row.result,
    createdAt: row.created_at,
  };
}
