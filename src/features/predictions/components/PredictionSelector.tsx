import { Pressable, Text, View } from "react-native";

import { MatchResult } from "@/features/matches/types/match-result";

type Props = {
  team1: string;
  team2: string;
  value: MatchResult | undefined;
  onChange: (value: MatchResult) => void;
};

export function PredictionSelector({ team1, team2, value, onChange }: Props) {
  const options = [
    { value: MatchResult.TEAM1, label: "1", caption: team1 },
    { value: MatchResult.DRAW, label: "X", caption: "Draw" },
    { value: MatchResult.TEAM2, label: "2", caption: team2 },
  ];

  return (
    <View className="flex-row gap-2">
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            className={`h-14 flex-1 items-center justify-center rounded-lg border px-2 ${
              isSelected
                ? "border-green-700 bg-green-700"
                : "border-zinc-200 bg-zinc-50"
            }`}
            onPress={() => onChange(option.value)}
          >
            <Text
                className={`text-lg font-semibold ${
                isSelected ? "text-white" : "text-zinc-800"
              }`}
              numberOfLines={1}
            >
              {option.label}
            </Text>
            <Text
              className={`mt-1 text-center text-[11px] font-semibold uppercase ${
                isSelected ? "text-green-100" : "text-zinc-500"
              }`}
              numberOfLines={1}
            >
              {option.caption}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
