
export class PredictionError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Le coup d'envoi est passe : plus aucune ecriture n'est autorisee (CdC 3.4). */
export class PredictionLockedError extends PredictionError {
  readonly name = "PredictionLockedError";

  constructor(readonly matchId: string) {
    super("Ce match est verrouille : le coup d'envoi est passe.");
  }
}

/** Le match est termine et son resultat est saisi. */
export class MatchFinishedError extends PredictionError {
  readonly name = "MatchFinishedError";

  constructor(readonly matchId: string) {
    super("Ce match est termine : le pronostic n'est plus modifiable.");
  }
}

/** Le matchId fourni n'existe pas, ou est invisible via RLS. */
export class MatchNotFoundError extends PredictionError {
  readonly name = "MatchNotFoundError";

  constructor(readonly matchId: string) {
    super("Match introuvable.");
  }
}