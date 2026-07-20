import { View, Text } from "react-native";

export function EmptyRanking() {
  return (
    <View className="flex-1 items-center justify-center px-6 py-16">
      <Text className="mb-3 text-4xl">🏆</Text>
      <Text className="mb-1 text-base font-semibold text-gray-900">
        Aucun classement pour le moment
      </Text>
      <Text className="text-center text-sm text-gray-500">
        Les points apparaîtront dès que des résultats de matchs seront saisis.
      </Text>
    </View>
  );
}