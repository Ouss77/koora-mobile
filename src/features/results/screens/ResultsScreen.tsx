import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Bell, Trophy, CheckCircle2, Percent } from "lucide-react-native";

import { useSession } from "@/features/auth/hooks/useSession";
import { BackgroundImage } from "@/shared/ui/BackgroundImage";
import { useProfileStats } from "@/features/profile/hooks/useProfileStats";
import type { ProfileStats } from "@/features/profile/types/profile";
import { StatCard } from "@/shared/ui/StatCard";

import { useMyResults } from "../hooks/useMyResults";
import { ResultCard } from "../components/ResultCard";

function SummarySkeleton() {
  return (
    <View className="flex-row gap-3">
      <View className="h-24 flex-1 rounded-2xl bg-zinc-100" />
      <View className="h-24 flex-1 rounded-2xl bg-zinc-100" />
      <View className="h-24 flex-1 rounded-2xl bg-zinc-100" />
    </View>
  );
}

function ResultsSummary({ stats }: { stats: ProfileStats | undefined }) {
  if (!stats) {
    return <SummarySkeleton />;
  }

  // Aucun match terminé : l'accuracy renvoyée par la RPC vaut 0 par défaut,
  // mais afficher "0 %" laisserait croire à des pronostics ratés. On masque
  // la valeur plutôt que d'afficher un pourcentage trompeur.
  const accuracyLabel =
    stats.matchesPlayed > 0 ? `${stats.accuracy}%` : "—";

  return (
    <View className="flex-row gap-3">
      <StatCard Icon={Trophy} label="Points" value={stats.points} />
      <StatCard
        Icon={CheckCircle2}
        label="Corrects"
        value={stats.correctPredictions}
      />
      <StatCard Icon={Percent} label="Réussite" value={accuracyLabel} />
    </View>
  );
}

function EmptyResults() {
  return (
    <View className="flex-1 items-center justify-center px-6 py-16">
      <Text className="mb-3 text-4xl">⚽</Text>
      <Text className="mb-1 text-base font-semibold text-gray-900">
        Aucun match terminé pour l&apos;instant
      </Text>
      <Text className="text-center text-sm text-gray-500">
        Fais tes pronostics avant le coup d&apos;envoi pour les voir
        apparaître ici une fois le match terminé.
      </Text>
    </View>
  );
}

export function ResultsScreen() {
  const { data: session } = useSession();
  const statsQuery = useProfileStats();
  const resultsQuery = useMyResults();

  const avatarLabel =
    session?.user?.email?.trim().charAt(0).toUpperCase() ??
    session?.user?.id?.trim().charAt(0).toUpperCase() ??
    "K";

  async function handleRefresh() {
    await Promise.all([resultsQuery.refetch(), statsQuery.refetch()]);
  }

  if (resultsQuery.isLoading) {
    return (
      <BackgroundImage overlayClassName="bg-slate-950/70">
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#047857" />
            <Text className="mt-3 font-poppins-semibold text-sm text-zinc-100">
              Chargement des résultats...
            </Text>
          </View>
        </SafeAreaView>
      </BackgroundImage>
    );
  }

  if (resultsQuery.isError) {
    return (
      <BackgroundImage overlayClassName="bg-slate-950/70">
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center px-6">
            <Text className="mb-4 text-center font-poppins-semibold text-base text-zinc-100">
              Impossible de charger tes résultats.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => resultsQuery.refetch()}
              className="rounded-lg bg-green-700 px-5 py-3"
            >
              <Text className="font-poppins-black text-sm text-white">
                Réessayer
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </BackgroundImage>
    );
  }

  const results = resultsQuery.data ?? [];

  return (
    <BackgroundImage overlayClassName="bg-slate-950/70">
      <SafeAreaView className="flex-1" style={{ flex: 1 }}>
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
            Mes résultats
          </Text>
        </View>

        <View className="h-11 w-11 items-center justify-center rounded-full bg-zinc-100">
          <Bell size={22} color="#047857" strokeWidth={2.5} />
        </View>
        </View>

        <View className="flex-1" style={{ flex: 1 }}>
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ResultCard result={item} />}
          contentContainerClassName="gap-3 px-4 pb-4"
          style={results.length === 0 ? { flex: 1 } : undefined}
          ListHeaderComponent={
            <View className="px-4 pb-4 pt-4">
              <ResultsSummary stats={statsQuery.data} />
            </View>
          }
          ListEmptyComponent={<EmptyResults />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={resultsQuery.isRefetching || statsQuery.isRefetching}
              onRefresh={handleRefresh}
              tintColor="#047857"
            />
          }
        />
        </View>
      </SafeAreaView>
    </BackgroundImage>
  );
}
