import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";

import { useRanking } from "../hooks/useRanking";
import { RankingItem } from "../components/RankingItem";
import { RankingHeader } from "../components/RankingHeader";
import { EmptyRanking } from "../components/EmptyRanking";

export function RankingScreen() {
  const { data, isLoading, isError, refetch } = useRanking();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-4 text-center text-base text-gray-900">
          Impossible de charger le classement.
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="rounded-lg bg-gray-900 px-5 py-3"
        >
          <Text className="text-sm font-semibold text-white">Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  const ranking = data ?? [];

  if (ranking.length === 0) {
    return <EmptyRanking />;
  }

  return (
    <FlatList
      data={ranking}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RankingItem user={item} />}
      ListHeaderComponent={RankingHeader}
      stickyHeaderIndices={[0]}
    />
  );
}