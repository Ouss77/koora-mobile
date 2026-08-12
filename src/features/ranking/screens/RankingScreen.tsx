import {
  View,  Text,  FlatList,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
} from "react-native";
import { Bell } from "lucide-react-native";

import { useSession } from "@/features/auth/hooks/useSession";

import { useRanking } from "../hooks/useRanking";
import { RankingItem } from "../components/RankingItem";
import { RankingHeader } from "../components/RankingHeader";
import { RankingPodium } from "../components/RankingPodium";
import { EmptyRanking } from "../components/EmptyRanking";

export function RankingScreen() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data, isLoading, isError, refetch } = useRanking();

  const avatarLabel =
    session?.user?.email?.trim().charAt(0).toUpperCase() ??
    userId?.trim().charAt(0).toUpperCase() ??
    "K";

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#047857" />
          <Text className="mt-3 font-poppins-semibold text-sm text-zinc-500">
            Chargement du classement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center font-poppins-semibold text-base text-zinc-800">
            Impossible de charger le classement.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => refetch()}
            className="rounded-lg bg-green-700 px-5 py-3"
          >
            <Text className="font-poppins-black text-sm text-white">
              Réessayer
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const ranking = data ?? [];
  const topThree = ranking.slice(0, 3);
  const rest = ranking.slice(3);
  const me = ranking.find((user) => user.id === userId);
  const myPercentile = me
    ? Math.max(1, Math.round((me.rank / ranking.length) * 100))
    : null;

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
      <View className="flex-row items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <View className="h-11 w-11 items-center justify-center rounded-full border border-green-600 bg-green-50">
          <Text className="font-poppins-black text-base text-green-800">
            {avatarLabel}
          </Text>
        </View>

        <View className="items-center">
          <Text className="font-poppins-black text-xl text-green-700">
            KOORA
          </Text>
          <Text className="font-poppins-semibold text-[11px] uppercase text-zinc-400">
            Classement
          </Text>
        </View>

        <View className="h-11 w-11 items-center justify-center rounded-full bg-zinc-100">
          <Bell size={22} color="#047857" strokeWidth={2.5} />
        </View>
      </View>

      <View className="flex-1" style={{ flex: 1 }}>
        {ranking.length === 0 ? (
          <EmptyRanking />
        ) : (
          <FlatList
            data={rest}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RankingItem user={item} isMe={item.id === userId} />
            )}
            contentContainerClassName="gap-3 px-4 pb-4"
            ListHeaderComponent={
              <View className="px-4 pt-4">
                <RankingHeader />
                <RankingPodium topThree={topThree} />
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {me && myPercentile !== null ? (
        <View
          className="border-t border-zinc-200 bg-white px-4 pb-4 pt-3"
          style={{ flexShrink: 0 }}
        >
          <View
            className="flex-row items-center gap-3 rounded-xl bg-green-800 px-4 py-3"
            style={{
              elevation: 4,
              shadowColor: "#065f46",
              shadowOpacity: 0.3,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            <View>
              <Text className="font-poppins-bold text-[10px] uppercase text-green-200">
                Rang
              </Text>
              <Text className="font-poppins-black text-lg text-white">
                #{me.rank}
              </Text>
            </View>

            <View className="h-11 w-11 items-center justify-center rounded-full border-2 border-green-400 bg-green-700">
              <Text className="font-poppins-black text-base text-white">
                {me.username.trim().charAt(0).toUpperCase()}
              </Text>
            </View>

            <View className="min-w-0 flex-1">
              <Text
                className="font-poppins-black text-sm text-white"
                numberOfLines={1}
              >
                Toi ({me.username})
              </Text>
              <Text className="font-poppins-semibold text-[11px] uppercase text-green-200">
                Top {myPercentile}% cette saison
              </Text>
            </View>

            <Text className="font-poppins-black text-lg text-white">
              {me.points.toLocaleString("en-US")}{" "}
              <Text className="font-poppins-semibold text-xs text-green-200">
                pts
              </Text>
            </Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
