// features/admin/screens/AdminDashboard.tsx
import { View, Text, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Plus, List, Trophy } from "lucide-react-native";
import { useSession } from "@/features/auth/hooks/useSession";

/**
 * ActionButton — bouton d'action du dashboard
 */
function ActionButton({
  Icon,
  title,
  description,
  onPress,
}: {
  Icon: typeof Plus;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-xl border border-green-200 bg-white p-4"
    >
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-green-100">
        <Icon size={24} color="#047857" strokeWidth={2} />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="font-poppins-black text-base text-zinc-900">{title}</Text>
        <Text className="mt-0.5 font-poppins-medium text-xs text-zinc-600">{description}</Text>
      </View>
      <View className="h-5 w-5 rounded-full bg-green-700" />
    </Pressable>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const { data: session } = useSession();

  const adminName = session?.user?.email?.split("@")[0] || "Admin";
  const avatarLabel = adminName.trim().charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ flex: 1 }}>
      {/* Header KOORA */}
      <View className="flex-row items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
        <View className="h-11 w-11 items-center justify-center rounded-full border border-green-600 bg-green-50">
          <Text className="font-poppins-black text-base text-green-800">{avatarLabel}</Text>
        </View>

        <View className="items-center">
          <Text className="font-poppins-black text-xl text-green-700">KOORA</Text>
          <Text className="font-poppins-semibold text-[11px] uppercase text-zinc-400">
            Administration
          </Text>
        </View>

        <View className="h-11 w-11 items-center justify-center rounded-full bg-zinc-100">
          <Trophy size={22} color="#047857" strokeWidth={2.5} />
        </View>
      </View>

      {/* Contenu */}
      <View className="flex-1" style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          style={{ flex: 1 }}
          contentContainerClassName="gap-4 px-4 pb-10 pt-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Section Actions */}
          <View>
            <Text className="mb-3 font-poppins-bold text-sm uppercase text-zinc-600">
              ⚽ Matchs
            </Text>
            <ActionButton
              Icon={Plus}
              title="Ajouter un match"
              description="Crée un nouveau match"
              onPress={() => router.push("/admin/create-match")}
            />
          </View>

          <View>
            <Text className="mb-3 font-poppins-bold text-sm uppercase text-zinc-600">
              📋 Gestion
            </Text>
            <ActionButton
              Icon={List}
              title="Gestion des matchs"
              description="Voir, éditer, supprimer"
              onPress={() => router.push("/admin/match-management")}
            />
          </View>

          {/* Info */}
          <View className="mt-4 rounded-xl bg-blue-50 px-4 py-3">
            <Text className="font-poppins-bold text-xs uppercase text-blue-700">💡 Conseil</Text>
            <Text className="mt-2 font-poppins-medium text-sm text-blue-800">
              Les pronostics verrouillent les modifications. Un match sans pronostic reste librement
              modifiable ; dès qu'un utilisateur pronostique, seul le résultat peut être changé.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}