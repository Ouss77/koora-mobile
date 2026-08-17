// app/admin/create-match.tsx
import { SafeAreaView, View, Text, ScrollView } from "react-native";
import { MatchForm } from "@/features/admin/screens/MatchForm";
import { useMatchMutations } from "@/features/admin/hooks/useMatchMutations";

export default function CreateMatchScreen() {
  const mutations = useMatchMutations();

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
      <View className="border-b border-zinc-200 bg-white px-4 py-3">
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