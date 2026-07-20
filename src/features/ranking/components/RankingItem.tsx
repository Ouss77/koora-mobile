import { memo } from "react";
import { View, Text } from "react-native";

import { RankingUser } from "../types/ranking-user";

interface RankingItemProps {
  user: RankingUser;
}

const MEDALS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

function RankingItemComponent({ user }: RankingItemProps) {
  const medal = MEDALS[user.rank];

  return (
    <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
      <View className="w-12 flex-row items-center">
        {medal ? (
          <Text className="text-xl">{medal}</Text>
        ) : (
          <Text className="text-base font-semibold text-gray-500">
            {user.rank}
          </Text>
        )}
      </View>

      <View className="flex-1 px-2">
        <Text className="text-base font-semibold text-gray-900">
          {user.username}
        </Text>
        <Text className="text-xs text-gray-500">
          {user.matchesPlayed} pronostics · {user.correctPredictions} corrects ·{" "}
          {user.accuracy}%
        </Text>
      </View>

      <Text className="text-base font-bold text-gray-900">
        {user.points} pts
      </Text>
    </View>
  );
}

export const RankingItem = memo(RankingItemComponent);