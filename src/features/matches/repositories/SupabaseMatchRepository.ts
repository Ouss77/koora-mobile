import { supabase } from "@/core/supabase/client";

import { Match } from "../types/match";
import { MatchStatus } from "../types/match-status";
import { IMatchRepository } from "./IMatchRepository";
import { MatchRow, toMatch } from "../mappers/matchMapper";
export class SupabaseMatchRepository implements IMatchRepository {
  private async fetchMatches(status?: MatchStatus): Promise<Match[]> {
    
    let query = supabase
      .from("matches")
      .select("*")
      .order("kickoff_at", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

const { data, error } = await query.returns<MatchRow[]>();

    if (error) {
      throw new Error(error.message);
    }

return (data ?? []).map(toMatch);  }

  async list(): Promise<Match[]> {
    return this.fetchMatches();
  }

  async listUpcoming(): Promise<Match[]> {
    return this.fetchMatches(MatchStatus.UPCOMING);
  }

  async listLocked(): Promise<Match[]> {
    return this.fetchMatches(MatchStatus.LOCKED);
  }

  async listFinished(): Promise<Match[]> {
    return this.fetchMatches(MatchStatus.FINISHED);
  }
}