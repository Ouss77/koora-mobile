import { useMatches } from "@/features/matches/hooks/useMatches";
import { isMatchOpen } from "../services/PredictionService";

/**
 * Les matchs ouverts aux pronostics (CdC 3.2).
 * Reutilise le cache ["matches"] : aucune requete supplementaire.
 * Le filtrage vient du Service, pas de l'ecran.
 */
export function usePredictableMatches() {
  const query = useMatches();
  return { ...query, data: query.data?.filter(isMatchOpen) };
}
