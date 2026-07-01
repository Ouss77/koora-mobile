import { Link } from "expo-router";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";

import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Logo } from "@/shared/ui/Logo";
import { Screen } from "@/shared/ui/Screen";

export default function LoginScreen() {
  return (
    <Screen contentClassName="justify-center">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="gap-10"
      >
        <Logo subtitle="Welcome back to KOORA" />

        <View className="gap-4">
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            label="Username"
            placeholder="Enter your username"
            textContentType="username"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            textContentType="password"
          />
        </View>

        <View className="gap-5">
          <Button title="Login" />

          <View className="flex-row justify-center gap-1">
            <Text className="text-base text-zinc-600">No account yet?</Text>
            <Link
              href={"/register" as never}
              className="text-base font-semibold text-green-700"
            >
              Register
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
