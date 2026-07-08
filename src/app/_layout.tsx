import { Stack } from "expo-router";
import "../../global.css";
import { AppQueryClientProvider } from "@/core/providers/query-client-provider";

export default function RootLayout() {
  return (
    <AppQueryClientProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppQueryClientProvider>
  );
}