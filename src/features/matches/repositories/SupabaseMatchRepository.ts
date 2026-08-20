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

  const rows = data ?? [];
  const teamNames = [...new Set(rows.flatMap((match) => [match.team1, match.team2]))];

  if (teamNames.length === 0) return rows.map(toMatch);

  const { data: teams } = await supabase
    .from("teams")
    .select("name, logo_url")
    .in("name", teamNames);
  const logosByName = new Map(
    (teams ?? []).map((team) => [team.name.toLowerCase(), team.logo_url as string | null]),
  );

  return rows.map((match) =>
    toMatch({
      ...match,
      team1_logo: logosByName.get(match.team1.toLowerCase()) ?? null,
      team2_logo: logosByName.get(match.team2.toLowerCase()) ?? null,
    }),
  );
  }

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

  async findById(id: string): Promise<Match | null> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .maybeSingle<MatchRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toMatch(data) : null;
  }
}
