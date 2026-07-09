import { Redirect, Stack, type Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";

export default function AppLayout() {
  const { isLoading, shouldRedirect, redirectTo } = useAuthGuard("requireAuth");

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (shouldRedirect) {
    return <Redirect href={redirectTo as Href} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
    </Stack>
  );
}