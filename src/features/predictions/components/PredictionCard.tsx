import { format } from "date-fns";
import { Text, View } from "react-native";
import { Clock3 } from "lucide-react-native";

import { Match } from "@/features/matches/types/match";
import { MatchResult } from "@/features/matches/types/match-result";

import { PredictionSelector } from "./PredictionSelector";
import { useCountdown } from "@/shared/hooks/useCountdown";

type Props = {
  match: Match;
  value: MatchResult | undefined;
  onChange: (value: MatchResult) => void;
};

export function PredictionCard({ match, value, onChange }: Props) {
  
  const kickoff = new Date(match.kickoffAt);   // gardé : sert juste à format() pour l'affichage
  const lockText = useCountdown(match.kickoffAt);
  const team1Initial = match.team1.trim().charAt(0).toUpperCase();
  const team2Initial = match.team2.trim().charAt(0).toUpperCase();

  return (
    <View className="gap-3 rounded-lg border border-zinc-200 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
            <Text className="text-xs font-bold text-green-700">K</Text>
          </View>
          <Text className="text-xs font-bold uppercase text-zinc-600">
            Koora League
          </Text>
        </View>

        <View className="flex-row items-center gap-1 rounded-full bg-amber-50 px-3 py-1">
          <Clock3 size={14} color="#52525b" />
          <Text className="text-[11px] font-bold uppercase text-amber-800">
            {lockText}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="min-w-0 flex-1 items-center">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-sky-50">
            <Text className="text-lg font-black text-green-700">
              {team1Initial}
            </Text>
          </View>
          <Text
            className="mt-2 text-center text-sm font-semibold text-zinc-900"
            numberOfLines={1}
          >
            {match.team1}
          </Text>
        </View>

        <View className="w-20 items-center">
          <Text className="text-2xl font-black text-zinc-200">VS</Text>
          <Text className="mt-1 text-sm font-bold text-zinc-600">
            {format(kickoff, "HH:mm")}
          </Text>
          <Text className="text-[11px] font-medium text-zinc-400">
            {format(kickoff, "dd/MM")}
          </Text>
        </View>

        <View className="min-w-0 flex-1 items-center">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-sky-50">
            <Text className="text-lg font-black text-green-700">
              {team2Initial}
            </Text>
          </View>
          <Text
            className="mt-2 text-center text-sm font-semibold text-zinc-900"
            numberOfLines={1}
          >
            {match.team2}
          </Text>
        </View>
      </View>

      <PredictionSelector
        team1={match.team1}
        team2={match.team2}
        value={value}
        onChange={onChange}
      />
    </View>
  );
}
