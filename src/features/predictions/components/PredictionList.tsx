import { FlatList, Text, View } from "react-native";

import { Match } from "@/features/matches/types/match";
import { MatchResult } from "@/features/matches/types/match-result";

import { PredictionCard } from "./PredictionCard";

type Props = {
  matches: Match[];
  selectionFor: (matchId: string) => MatchResult | undefined;
  onSelect: (matchId: string, value: MatchResult) => void;
};

export function PredictionList({ matches, selectionFor, onSelect }: Props) {
  return (
    <FlatList
      data={matches}
      keyExtractor={(match) => match.id}
      contentContainerClassName="gap-3 p-4"
      ListEmptyComponent={
        <View className="items-center py-12">
          <Text className="text-zinc-500">Aucun match ouvert aux pronostics.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <PredictionCard
          match={item}
          value={selectionFor(item.id)}
          onChange={(value) => onSelect(item.id, value)}
        />
      )}
    />
  );
}