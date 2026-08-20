import { memo } from "react";
import { View, Text } from "react-native";

import { RankingUser } from "../types/ranking-user";

interface RankingItemProps {
  user: RankingUser;
  isMe?: boolean;
}

const medalColors: Record<number, string> = {
  1: "#f59e0b",
  2: "#94a3b8",
  3: "#c2410c",
};

function RankingItemComponent({ user, isMe = false }: RankingItemProps) {
  const medalColor = medalColors[user.rank];

  return (
    <View
      className={`flex-row items-center gap-3 rounded-xl border px-4 py-3 ${
        isMe
          ? "border-green-600 bg-green-50"
          : "border-transparent bg-white"
      }`}
      style={{
        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
      }}
    >
      <View className="w-12 flex-row items-center gap-1">
        <Text
          className={`font-poppins-bold text-sm ${
            user.rank === 1
              ? "text-amber-600"
              : user.rank === 2
                ? "text-slate-500"
                : user.rank === 3
                  ? "text-orange-700"
                  : "text-zinc-400"
          }`}
        >
          #{user.rank}
        </Text>
        {medalColor ? (
          <View
            accessibilityLabel={`Médaille rang ${user.rank}`}
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: medalColor }}
          />
        ) : null}
      </View>

      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${
          isMe ? "bg-green-600" : "bg-zinc-100"
        }`}
      >
        <Text
          className={`font-poppins-black text-base ${
            isMe ? "text-white" : "text-green-700"
          }`}
        >
          {user.username.trim().charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text
        className="flex-1 font-poppins-bold text-base text-zinc-900"
        numberOfLines={1}
      >
        {isMe ? `${user.username} (toi)` : user.username}
      </Text>

      <Text className="font-poppins-black text-base text-green-700">
        {user.points.toLocaleString("en-US")}{" "}
        <Text className="font-poppins-semibold text-xs text-zinc-400">
          pts
        </Text>
      </Text>
    </View>
  );
}

export const RankingItem = memo(RankingItemComponent);
