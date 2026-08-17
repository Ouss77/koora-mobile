// app/admin/edit-match.tsx
import { SafeAreaView, View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MatchForm } from "@/features/admin/screens/MatchForm";
import { useMatchMutations } from "@/features/admin/hooks/useMatchMutations";
import { useAdminMatches } from "@/features/admin/hooks/useAdminMatches";

export default function EditMatchScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { data: matches, isLoading } = useAdminMatches();
  const mutations = useMatchMutations();

  const match = matches?.find((m) => m.id === matchId);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#047857" />
        </View>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center font-poppins-semibold text-base text-zinc-800">
            Match introuvable.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
      <View className="border-b border-zinc-200 bg-white px-4 py-3">
        <Text className="font-poppins-black text-lg text-zinc-900">Modifier un match</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <MatchForm
          mode="edit"
          match={match}
          onSubmit={async (payload) => {
            await mutations.update.mutateAsync({ match, payload });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}