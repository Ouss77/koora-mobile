import { Redirect, Stack, Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";

export default function AuthLayout() {
  const { isLoading, shouldRedirect, redirectTo } = useAuthGuard("requireGuest");

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (shouldRedirect) {
    return <Redirect href={redirectTo as Href}  />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}