// features/admin/components/ResultSelector.tsx
import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import type { MatchResultValue } from "@/features/admin/types/admin.types";

type ResultSelectorProps = {
  team1: string;
  team2: string;
  onSelect: (result: MatchResultValue) => void;
  disabled?: boolean;
};

function ResultOption({
  label,
  onPress,
  disabled,
  isActive,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  isActive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-1 rounded-lg px-3 py-4 ${
        isActive
          ? "bg-green-700"
          : disabled
            ? "bg-zinc-100"
            : "border border-green-700 bg-white"
      }`}
    >
      <Text
        className={`text-center font-poppins-black text-sm ${
          isActive
            ? "text-white"
            : disabled
              ? "text-zinc-400"
              : "text-green-700"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ResultSelectorComponent({
  team1,
  team2,
  onSelect,
  disabled = false,
}: ResultSelectorProps) {
  return (
    <View className="gap-3 px-4 py-6">
      <Text className="mb-2 text-center font-poppins-bold text-sm uppercase text-zinc-600">
        Qui a gagné ?
      </Text>

      <View className="flex-row gap-2">
        <ResultOption
          label={team1}
          onPress={() => onSelect("team1")}
          disabled={disabled}
        />
        <ResultOption
          label="Match nul"
          onPress={() => onSelect("draw")}
          disabled={disabled}
        />
        <ResultOption
          label={team2}
          onPress={() => onSelect("team2")}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

export const ResultSelector = memo(ResultSelectorComponent);