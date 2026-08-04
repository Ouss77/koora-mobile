export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string; // ISO ; formaté à l'affichage avec date-fns
}

export interface ProfileStats {
  points: number;
  rank: number;
  matchesPlayed: number;
  correctPredictions: number;
  wrongPredictions: number; // dérivé, pas renvoyé par la RPC
  accuracy: number; // vient tel quel de la RPC — on ne le recalcule pas
}