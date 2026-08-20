import { LogOut } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useLogoutFlow } from "../hooks/useLogoutFlow";

export function ProfileMenu() {
  const { confirmLogout, isPending } = useLogoutFlow();

  return (
    <View className="items-center mt-4">
      <Pressable
        onPress={confirmLogout}
        disabled={isPending}
        className="flex-row items-center gap-2 rounded-full border border-red-200 px-4 py-2 active:opacity-70 bg-red-50/60"
      >
        <LogOut size={16} color="#dc2626" strokeWidth={2.5} />
        <Text className="font-poppins-semibold text-sm text-red-600">
          {isPending ? "Déconnexion…" : "Se déconnecter"}
        </Text>
      </Pressable>
    </View>
  );
}
