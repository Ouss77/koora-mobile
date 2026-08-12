import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";
import "../../global.css";
import { AppQueryClientProvider } from "@/core/providers/query-client-provider";
import { adminService } from "@/features/admin/services/adminService";
import { supabase } from "@/core/supabase/client";

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppQueryClientProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppQueryClientProvider>
  );
}