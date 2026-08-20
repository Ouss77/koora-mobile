// features/results/components/ResultCard.tsx
import { memo } from "react";
import { View, Text } from "react-native";
import { CheckCircle2, XCircle } from "lucide-react-native";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import type { MyResult, MatchResultValue } from "@/features/results/types/result.types";
import { TeamLogo } from "@/shared/components/TeamLogo";

type ResultCardProps = {
  result: MyResult;
};

/**
 * Traduction d'affichage : jamais de valeur brute d'enum à l'écran.
 * `team1`/`team2` → nom réel de l'équipe, `draw` → « Match nul ».
 */
function resultLabel(
  value: MatchResultValue,
  team1: string,
  team2: string,
): string {
  if (value === "team1") return team1;
  if (value === "team2") return team2;
  return "Match nul";
}

function ResultCardComponent({ result }: ResultCardProps) {
  const { match, prediction, actualResult, pointsAwarded, outcome } = result;
  const isCorrect = outcome === "correct";

  return (
    <View
      className={`rounded-xl border bg-white p-4 ${
        isCorrect ? "border-green-200" : "border-zinc-200"
      }`}
    >
      {/* En-tête : équipes + date */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1 items-center">
              <TeamLogo logoUrl={match.team1Logo} teamName={match.team1} size="lg" />
              <Text className="mt-2 text-center font-poppins-black text-sm text-zinc-900" numberOfLines={1}>
              {match.team1}
              </Text>
            </View>
            <Text className="mt-4 font-poppins-semibold text-sm text-zinc-400">vs</Text>
            <View className="min-w-0 flex-1 items-center">
              <TeamLogo logoUrl={match.team2Logo} teamName={match.team2} size="lg" />
              <Text className="mt-2 text-center font-poppins-black text-sm text-zinc-900" numberOfLines={1}>
              {match.team2}
              </Text>
            </View>
          </View>
          <Text className="mt-0.5 font-poppins-semibold text-[11px] uppercase text-zinc-400">
            {format(match.kickoffAt, "EEE d MMM · HH:mm", { locale: fr })}
          </Text>
        </View>

        {/* Badge points */}
        <View
          className={`flex-row items-center gap-1 rounded-full px-3 py-1.5 ${
            isCorrect ? "bg-green-700" : "bg-zinc-100"
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 size={14} color="#ffffff" strokeWidth={2.5} />
          ) : (
            <XCircle size={14} color="#a1a1aa" strokeWidth={2.5} />
          )}
          <Text
            className={`font-poppins-black text-xs ${
              isCorrect ? "text-white" : "text-zinc-500"
            }`}
          >
            {isCorrect ? `+${pointsAwarded} pts` : "0 pt"}
          </Text>
        </View>
      </View>

      {/* Pronostic vs Résultat */}
      <View className="mt-3 flex-row gap-3">
        <View className="min-w-0 flex-1 rounded-lg bg-zinc-50 px-3 py-2">
          <Text className="font-poppins-bold text-[10px] uppercase text-zinc-400">
            Ton pronostic
          </Text>
          <Text
            className={`font-poppins-black text-sm ${
              isCorrect ? "text-green-700" : "text-red-600"
            }`}
            numberOfLines={1}
          >
            {resultLabel(prediction, match.team1, match.team2)}
          </Text>
        </View>

        <View className="min-w-0 flex-1 rounded-lg bg-zinc-50 px-3 py-2">
          <Text className="font-poppins-bold text-[10px] uppercase text-zinc-400">
            Résultat
          </Text>
          <Text
            className="font-poppins-black text-sm text-zinc-900"
            numberOfLines={1}
          >
            {resultLabel(actualResult, match.team1, match.team2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export const ResultCard = memo(ResultCardComponent);
