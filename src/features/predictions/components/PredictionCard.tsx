import { format } from "date-fns";
import { Text, View } from "react-native";

import { Match } from "@/features/matches/types/match";
import { MatchResult } from "@/features/matches/types/match-result";

import { PredictionSelector } from "./PredictionSelector";

type Props = {
  match: Match;
  value: MatchResult | undefined;
  onChange: (value: MatchResult) => void;
};

export function PredictionCard({ match, value, onChange }: Props) {
  const kickoff = new Date(match.kickoffAt);

  return (
    <View className="gap-3 rounded-xl border border-zinc-200 p-4">
      <Text className="text-base font-semibold text-zinc-900">
        {match.team1} — {match.team2}
      </Text>

      <Text className="text-sm text-zinc-500">
        {format(kickoff, "dd/MM/yyyy")} · {format(kickoff, "HH:mm")}
      </Text>

      <PredictionSelector
        team1={match.team1}
        team2={match.team2}
        value={value}
        onChange={onChange}
      />
    </View>
  );
}