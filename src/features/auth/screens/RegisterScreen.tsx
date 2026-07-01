import { Link } from "expo-router";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";

import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Logo } from "@/shared/ui/Logo";
import { Screen } from "@/shared/ui/Screen";

export default function RegisterScreen() {
  return (
    <Screen contentClassName="justify-center">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="gap-10"
      >
        <Logo subtitle="Create your KOORA account" />

        <View className="gap-4">
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            label="Username"
            placeholder="Choose a username"
            textContentType="username"
          />

          <Input
            label="Password"
            placeholder="Create a password"
            secureTextEntry
            textContentType="newPassword"
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
            textContentType="newPassword"
          />
        </View>

        <View className="gap-5">
          <Button title="Register" />

          <View className="flex-row justify-center gap-1">
            <Text className="text-base text-zinc-600">
              Already have an account?
            </Text>
            <Link
              href="./login"
              className="text-base font-semibold text-green-700"
            >
              Login
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
