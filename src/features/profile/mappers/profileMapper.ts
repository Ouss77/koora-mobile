import { Profile, ProfileStats } from '../types/profile';
import { UserRow, RankRow } from '../schemas/profile.schema';

export function mapUserRowToProfile(row: UserRow): Profile {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

export function mapRankRowToStats(row: RankRow): ProfileStats {
  return {
    points: row.points,
    rank: row.rank,
    matchesPlayed: row.matches_played,
    correctPredictions: row.correct_predictions,
    // Complément arithmétique, pas un second calcul de score.
    wrongPredictions: row.matches_played - row.correct_predictions,
    // Fourni par la RPC : source de vérité unique, partagée avec le classement.
    accuracy: row.accuracy,
  };
}