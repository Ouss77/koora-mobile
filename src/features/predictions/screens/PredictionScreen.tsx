import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Send,
  Trophy,
} from "lucide-react-native";

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

type Notice = {
  type: "success" | "error";
  title: string;
  message: string;
};

export function PredictionScreen() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: matches, isLoading: matchesLoading } = usePredictableMatches();
  const { data: predictions, isLoading: predictionsLoading } = usePredictions(userId);
  const { mutate: save, isPending, error } = useSavePredictions(userId);

  /** Les choix faits dans cet ecran, pas encore envoyes. */
  const [draft, setDraft] = useState<Record<string, MatchResult>>({});
  const [notice, setNotice] = useState<Notice | null>(null);

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
  const visibleNotice =
    notice ??
    (error
      ? {
          type: "error" as const,
          title: "Enregistrement impossible",
          message: messageFor(error),
        }
      : null);
  const canSave = changes.length > 0 && !!userId && !isPending;
  const avatarLabel =
    session?.user?.email?.trim().charAt(0).toUpperCase() ??
    session?.user?.id?.trim().charAt(0).toUpperCase() ??
    "K";

  const handleSave = () => {
    if (changes.length === 0) {
      return;
    }

    setNotice(null);
    save(changes, {
      onSuccess: () => {
        setDraft({});
        setNotice({
          type: "success",
          title: "Pronostics enregistrés",
          message: "Tes choix sont sauvegardés. Tu peux les modifier avant le coup d'envoi.",
        });
      },
      onError: (mutationError) => {
        setNotice({
          type: "error",
          title: "Enregistrement impossible",
          message: messageFor(mutationError),
        });
      },
    });
  };

  const header = (
    <View className="gap-4">
      <View className="overflow-hidden rounded-lg bg-green-800 p-4">
        <View className="absolute -right-8 -top-8 h-24 w-24 rounded-full border-[14px] border-green-600/40" />
        <View className="absolute bottom-4 right-8 h-10 w-10 rounded-lg bg-amber-300/25" />

        <View className="flex-row items-center gap-2">
          <Trophy size={17} color="#fde68a" />
          <Text className="text-xs font-black uppercase text-green-100">
            Challenge du jour
          </Text>
        </View>
        <Text className="mt-2 text-2xl font-black text-white">
          Choisis tes vainqueurs
        </Text>
        <View className="mt-3 flex-row gap-2">
          <View className="rounded-lg bg-green-700 px-3 py-2">
            <Text className="text-xs font-semibold text-green-100">
              Jackpot
            </Text>
            <Text className="text-base font-black text-white">2,500 pts</Text>
          </View>
          <View className="rounded-lg bg-green-700 px-3 py-2">
            <Text className="text-xs font-semibold text-green-100">
              Objectif
            </Text>
            <Text className="text-base font-black text-white">5 picks</Text>
          </View>
        </View>
      </View>

      <View className="pb-1">
        <Text className="text-2xl font-black text-zinc-950">
          Matchs disponibles
        </Text>
        <Text className="mt-1 text-sm font-medium text-zinc-500">
          {"Les pronostics restent modifiables avant le coup d'envoi."}
        </Text>
      </View>
    </View>
  );

  if (matchesLoading || predictionsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#047857" />
          <Text className="mt-3 text-sm font-semibold text-zinc-500">
            Chargement des pronostics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
      <View className="flex-row items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <View className="h-11 w-11 items-center justify-center rounded-full border border-green-600 bg-green-50">
          <Text className="text-base font-black text-green-800">{avatarLabel}</Text>
        </View>

        <View className="items-center">
          <Text className="text-xl font-black text-green-700">KOORA</Text>
          <Text className="text-[11px] font-semibold uppercase text-zinc-400">
            Predictions
          </Text>
        </View>

        <View className="h-11 w-11 items-center justify-center rounded-full bg-zinc-100">
          <Bell size={22} color="#047857" strokeWidth={2.5} />
        </View>
      </View>

      <View className="flex-1" style={{ flex: 1 }}>
        <PredictionList
          matches={matches ?? []}
          selectionFor={selectionFor}
          onSelect={(matchId, value) => {
            setNotice(null);
            setDraft((current) => ({ ...current, [matchId]: value }));
          }}
          ListHeaderComponent={header}
        />
      </View>

      <View
        className="gap-3 border-t border-zinc-200 bg-white px-4 pb-4 pt-3"
        style={{ flexShrink: 0 }}
      >
        {visibleNotice ? (
          <View
            className={`flex-row items-start gap-3 rounded-lg border px-3 py-3 ${
              visibleNotice.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            {visibleNotice.type === "success" ? (
              <CheckCircle2 size={22} color="#047857" />
            ) : (
              <AlertTriangle size={22} color="#dc2626" />
            )}
            <View className="min-w-0 flex-1">
              <Text
                className={`text-sm font-black ${
                  visibleNotice.type === "success"
                    ? "text-green-800"
                    : "text-red-700"
                }`}
              >
                {visibleNotice.title}
              </Text>
              <Text
                className={`mt-1 text-sm leading-5 ${
                  visibleNotice.type === "success"
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {visibleNotice.message}
              </Text>
            </View>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          className={`h-14 flex-row items-center justify-center gap-3 rounded-lg ${
            canSave ? "bg-green-700" : "bg-zinc-300"
          }`}
          disabled={!canSave}
          onPress={handleSave}
        >
          {isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text className="text-lg font-black text-white">
                {changes.length > 0
                  ? `Enregistrer ${changes.length} choix`
                  : "Aucun changement"}
              </Text>
              <Send size={22} color="#ffffff" strokeWidth={2.5} />
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
