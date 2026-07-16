/**
 * Erreurs metier du domaine "pronostics".
 *
 * Levees UNIQUEMENT par le PredictionService.
 * Le Repository, lui, ne rencontre que des pannes (reseau, RLS, contrainte)
 * et reste sur `throw new Error(error.message)`, comme le Sprint 3.
 *
 * Interet : l'UI (Issue 4) pourra faire `if (e instanceof PredictionLockedError)`
 * et afficher un message utile, au lieu de parser une chaine de caracteres.
 */

export class PredictionError extends Error {
  constructor(message: string) {
    super(message);
    // Sans cette ligne, `instanceof` casse des que la cible TS descend sous
    // ES2015 : le catch tomberait toujours dans le cas generique. Ne pas retirer.
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