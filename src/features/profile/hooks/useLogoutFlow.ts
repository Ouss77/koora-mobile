import { useLogout } from "@/features/auth/hooks/useLogout";
import { useRouter } from "expo-router";
import { Alert, Platform } from "react-native";

export function useLogoutFlow() {
  const router = useRouter();
  const logout = useLogout();

  async function handleLogout() {
    try {
      await logout.mutateAsync();
      router.replace("/login");
    } catch {
      Alert.alert("Erreur", "La déconnexion a échoué. Réessaie.");
    }
  }

  function confirmLogout() {
    if (Platform.OS === "web") {
      // window.confirm is necessary on web because Alert.alert doesn't
      // trigger callbacks reliably on react-native-web.
      if (window.confirm("Tu veux vraiment te déconnecter ?")) {
        void handleLogout();
      }
      return;
    }

    Alert.alert("Déconnexion", "Tu veux vraiment te déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", style: "destructive", onPress: handleLogout },
    ]);
  }

  return {
    confirmLogout,
    isPending: logout.isPending,
  } as const;
}
