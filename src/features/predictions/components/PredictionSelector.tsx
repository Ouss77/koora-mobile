import { View } from "react-native";

import { Button } from "@/shared/ui/Button";
import { MatchResult } from "@/features/matches/types/match-result";

type Props = {
  team1: string;
  team2: string;
  value: MatchResult | undefined;
  onChange: (value: MatchResult) => void;
};

export function PredictionSelector({ team1, team2, value, onChange }: Props) {
  return (
    <View className="flex-row gap-2">
      <Button
        className="flex-1"
        title={team1}
        variant={value === MatchResult.TEAM1 ? "primary" : "ghost"}
        onPress={() => onChange(MatchResult.TEAM1)}
      />
      <Button
        className="flex-1"
        title="Nul"
        variant={value === MatchResult.DRAW ? "primary" : "ghost"}
        onPress={() => onChange(MatchResult.DRAW)}
      />
      <Button
        className="flex-1"
        title={team2}
        variant={value === MatchResult.TEAM2 ? "primary" : "ghost"}
        onPress={() => onChange(MatchResult.TEAM2)}
      />
    </View>
  );
}