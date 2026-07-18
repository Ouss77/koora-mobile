import { useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { Button } from "@/shared/ui/Button";
import { useSession } from "@/features/auth/hooks/useSession";
import { MatchResult } from "@/features/matches/types/match-result";

import { PredictionList } from "../components/PredictionList";
import { usePredictableMatches } from "../hooks/usePredictableMatches";
import { usePredictions } from "../hooks/usepredictions";
import { useSavePredictions } from "../hooks/usesavepredictions";
import {
  MatchFinishedError,
  MatchNotFoundError,
  PredictionLockedError,
} from "../errors/prediction.errors";

function messageFor(error: unknown): string {
  if (error instanceof PredictionLockedError) {
    return "Un match s'est verrouillé entre-temps. Rien n'a été enregistré.";
  }
  if (error instanceof MatchFinishedError) {
    return "Un match est déjà terminé. Rien n'a été enregistré.";
  }
  if (error instanceof MatchNotFoundError) {
    return "Un match est introuvable. Rien n'a été enregistré.";
  }
  return "Une erreur est survenue. Réessayez.";
}

export function PredictionScreen() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: matches, isLoading: matchesLoading } = usePredictableMatches();
  const { data: predictions, isLoading: predictionsLoading } = usePredictions(userId);
  const { mutate: save, isPending, error, isSuccess } = useSavePredictions(userId);

  /** Les choix faits dans cet ecran, pas encore envoyes. */
  const [draft, setDraft] = useState<Record<string, MatchResult>>({});

  /** Ce qui est deja en base, indexe par match. */
  const saved = useMemo(
    () => new Map(predictions?.map((p) => [p.matchId, p.prediction])),
    [predictions],
  );

  /**
   * Seules les selections qui different de la base sont envoyees.
   * Un match auquel l'utilisateur n'a pas touche ne peut donc pas faire
   * echouer le lot s'il se verrouille pendant qu'il reflechit.
   */
  const changes = useMemo(
    () =>
      Object.entries(draft)
        .filter(([matchId, prediction]) => saved.get(matchId) !== prediction)
        .map(([matchId, prediction]) => ({ matchId, prediction })),
    [draft, saved],
  );

  const selectionFor = (matchId: string) => draft[matchId] ?? saved.get(matchId);

  if (matchesLoading || predictionsLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <PredictionList
        matches={matches ?? []}
        selectionFor={selectionFor}
        onSelect={(matchId, value) =>
          setDraft((current) => ({ ...current, [matchId]: value }))
        }
      />

      <View className="gap-2 border-t border-zinc-200 p-4">
        {error ? (
          <Text className="text-sm text-red-600">{messageFor(error)}</Text>
        ) : null}

        {isSuccess && changes.length === 0 ? (
          <Text className="text-sm text-green-700">Pronostics enregistrés.</Text>
        ) : null}

        <Button
          title="Valider mes pronostics"
          isLoading={isPending}
          disabled={changes.length === 0}
          onPress={() => save(changes)}
        />
      </View>
    </View>
  );
}
