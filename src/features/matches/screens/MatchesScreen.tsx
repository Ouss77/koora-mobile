import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { MatchCard } from "@/shared/components/MatchCard";
import { useMatches } from "../hooks/useMatches";

export function MatchesScreen() {
  const {
    data: matches,
    isLoading,
    error,
    refetch,
  } = useMatches();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-gray-500">
          Loading matches...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-lg font-semibold text-red-600">
          Unable to load matches
        </Text>

        <Text
          className="text-blue-600"
          onPress={() => refetch()}
        >
          Tap to retry
        </Text>
      </View>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">
          No matches available.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={matches}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <MatchCard match={item} />
      )}
    />
  );
}
