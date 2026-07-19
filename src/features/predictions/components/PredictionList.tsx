import { ReactElement } from "react";
import { ScrollView, Text, View } from "react-native";

import { Match } from "@/features/matches/types/match";
import { MatchResult } from "@/features/matches/types/match-result";

import { PredictionCard } from "./PredictionCard";

type Props = {
  matches: Match[];
  selectionFor: (matchId: string) => MatchResult | undefined;
  onSelect: (matchId: string, value: MatchResult) => void;
  ListHeaderComponent?: ReactElement;
  ListFooterComponent?: ReactElement;
};

export function PredictionList({
  matches,
  selectionFor,
  onSelect,
  ListHeaderComponent,
  ListFooterComponent,
}: Props) {
  return (
    <ScrollView
      className="flex-1"
      style={{ flex: 1 }}
      contentContainerClassName="gap-3 px-4 pb-6 pt-4"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {ListHeaderComponent}

      {matches.length === 0 ? (
        <View className="items-center rounded-lg border border-zinc-200 bg-white px-6 py-12">
          <Text className="text-center text-base font-semibold text-zinc-800">
            Aucun match ouvert aux pronostics
          </Text>
          <Text className="mt-2 text-center text-sm text-zinc-500">
            Reviens plus tard pour placer tes prochains choix.
          </Text>
        </View>
      ) : (
        matches.map((item) => (
          <PredictionCard
            key={item.id}
            match={item}
            value={selectionFor(item.id)}
            onChange={(value) => onSelect(item.id, value)}
          />
        ))
      )}

      {ListFooterComponent}
    </ScrollView>
  );
}
