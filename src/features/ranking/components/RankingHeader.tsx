import { View, Text } from "react-native";

export function RankingHeader() {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
      <Text className="w-12 text-xs font-medium uppercase text-gray-500">
        Rang
      </Text>
      <Text className="flex-1 px-2 text-xs font-medium uppercase text-gray-500">
        Joueur
      </Text>
      <Text className="text-xs font-medium uppercase text-gray-500">Points</Text>
    </View>
  );
}