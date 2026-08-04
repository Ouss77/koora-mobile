import { supabase } from '@/core/supabase/client'; // ← vérifie ce chemin
import { IProfileRepository } from './IProfileRepository';
import { Profile, ProfileStats } from '../types/profile';
import { mapUserRowToProfile, mapRankRowToStats } from '../mappers/profileMapper';
import { userRowSchema, rankRowSchema } from '../schemas/profile.schema';

export class ProfileRepositoryError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ProfileRepositoryError';
  }
}

export class SupabaseProfileRepository implements IProfileRepository {
  async getProfile(): Promise<Profile> {
    // Pas de .eq(id) : la RLS restreint déjà au user connecté.
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, created_at')
      .single();

    if (error) {
      throw new ProfileRepositoryError('Échec de récupération du profil.', error);
    }

    const row = userRowSchema.parse(data);
    return mapUserRowToProfile(row);
  }

  async getStats(): Promise<ProfileStats> {
    const { data, error } = await supabase
      .rpc('get_current_user_rank')
      .single();

    if (error) {
      throw new ProfileRepositoryError('Échec de récupération des statistiques.', error);
    }

    const row = rankRowSchema.parse(data);
    return mapRankRowToStats(row);
  }
}