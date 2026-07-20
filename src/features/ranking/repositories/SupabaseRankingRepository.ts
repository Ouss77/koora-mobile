import { supabase } from "@/core/supabase/client";

import { RankingUser } from "../types/ranking-user";
import { IRankingRepository } from "./IRankingRepository";
import { RankingRow, toRankingUser } from "../mappers/rankingMapper";

export class SupabaseRankingRepository implements IRankingRepository {
    
  async getRanking(): Promise<RankingUser[]> {
    const { data, error } = await supabase.rpc("get_ranking");

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as RankingRow[]).map(toRankingUser);
  }

  async getCurrentUserRank(): Promise<RankingUser | null> {
    const { data, error } = await supabase.rpc("get_current_user_rank");

    if (error) {
      throw new Error(error.message);
    }

    const row = ((data ?? []) as RankingRow[])[0];
    return row ? toRankingUser(row) : null;
  }
}