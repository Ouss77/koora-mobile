import { Text, View } from "react-native";

type Match = {
  team1: string;
  team2: string;
  kickoffAt: string | number | Date;
  status: string;
};

type MatchCardProps = {
  match: Match;
};

export function MatchCard({ match }: MatchCardProps) {
  return (
    <View className="mb-3 rounded-xl border border-gray-200 bg-white p-4">
      <Text className="mb-2 text-lg font-bold text-gray-900">
        {match.team1} vs {match.team2}
      </Text>

      <Text className="mb-3 text-sm text-gray-500">
        {new Date(match.kickoffAt).toLocaleString()}
      </Text>

      <View className="self-start rounded-full bg-gray-200 px-3 py-1">
        <Text className="text-xs font-semibold uppercase text-gray-700">
          {match.status}
        </Text>
      </View>
    </View>
  );
}