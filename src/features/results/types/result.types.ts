export type MatchResultValue = 'team1' | 'draw' | 'team2';
export type ResultOutcome = 'correct' | 'incorrect';

/** Ligne brute renvoyée par Supabase (repository → mapper). */
export interface RawResultRow {
  id: string;
  prediction: MatchResultValue;
  points_awarded: number;
  matches: {
    id: string;
    team1: string;
    team2: string;
    kickoff_at: string;
    result: MatchResultValue; // non-null : on ne requête que des matchs finished
  };
}

/** Modèle domaine consommé par les hooks et l'UI. */
export interface MyResult {
  id: string;
  match: {
    id: string;
    team1: string;
    team2: string;
    kickoffAt: Date;
  };
  prediction: MatchResultValue;
  actualResult: MatchResultValue;
  pointsAwarded: number;
  /** Dérivé de prediction === actualResult — JAMAIS de points_awarded. */
  outcome: ResultOutcome;
}