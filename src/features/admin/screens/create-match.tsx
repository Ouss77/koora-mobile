// app/admin/create-match.tsx
import { SafeAreaView, View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { MatchForm } from "@/features/admin/screens/MatchForm";
import { useMatchMutations } from "@/features/admin/hooks/useMatchMutations";

export default function CreateMatchScreen() {
  const router = useRouter();
  const mutations = useMatchMutations();

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
      <View className="flex-row items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour au tableau de bord"
          onPress={() => router.replace("/admin")}
          className="rounded-lg bg-zinc-100 px-3 py-2"
        >
          <Text className="font-poppins-bold text-sm text-zinc-800">← Retour</Text>
        </Pressable>
        <Text className="font-poppins-black text-lg text-zinc-900">Ajouter un match</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <MatchForm
          mode="create"
          onSubmit={async (payload) => {
            await mutations.create.mutateAsync(payload);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
