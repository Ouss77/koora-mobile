import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthDestination } from "@/features/auth/hooks/useAuthGuard";

export default function Index() {
  const { isLoading, destination } = useAuthDestination();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={destination} />;
}