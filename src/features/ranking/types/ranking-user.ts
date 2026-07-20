export interface RankingUser {
  id: string;
  username: string;
  points: number;
  rank: number;
  matchesPlayed: number;
  correctPredictions: number;
  accuracy: number; // pourcentage entier 0..100
}