import { Redirect } from "expo-router";
import { ActivityIndicator, SafeAreaView } from "react-native";
import { useIsAdmin } from "@/features/admin/hooks/useIsAdmin";
import ComingSoon from "@/shared/components/ComingSoon";

export default function AdminScreen() {
  const { isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 items-center justify-center">
        <ActivityIndicator size="large" color="#047857" />
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return <Redirect href="/(tabs)" />;
  }

  return <ComingSoon label="Tableau de bord admin bientôt disponible" />;
}
