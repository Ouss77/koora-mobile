import { z } from 'zod';

// Ligne brute de public.users
export const userRowSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(['user', 'admin']),
  created_at: z.string(),
});

// Ligne brute renvoyée par la RPC get_current_user_rank
export const rankRowSchema = z.object({
  user_id: z.string().uuid(),
  username: z.string(),
  points: z.number().int(),
  matches_played: z.number().int(),
  correct_predictions: z.number().int(),
  accuracy: z.number().int(), // pourcentage entier 0–100, calculé par la RPC
  rank: z.number().int(),
});

export type UserRow = z.infer<typeof userRowSchema>;
export type RankRow = z.infer<typeof rankRowSchema>;