import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Logo } from "@/shared/ui/Logo";
import { Screen } from "@/shared/ui/Screen";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { LoginFormData, loginSchema } from "../schemas/loginSchema";

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const onSubmit = (data: LoginFormData) => {
    console.log("Donnees de connexion:", data);
  };
  return (
    <Screen contentClassName="justify-center">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="gap-10"
      >
        <Logo subtitle="Bon retour sur KOORA" />
        <View className="gap-4">
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                autoCorrect={false}
                label="Pseudo"
                placeholder="Entre ton pseudo"
                textContentType="username"
              />
            )}
          />
          {errors.username && (
            <Text className="text-red-500 text-sm">
              {errors.username.message}
            </Text>
          )}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                label="Mot de passe"
                placeholder="Entre ton mot de passe"
                secureTextEntry
                textContentType="password"
              />
            )}
          />
          {errors.password && (
            <Text className="text-red-500 text-sm">
              {errors.password.message}
            </Text>
          )}
        </View>
        <View className="gap-5">
          <Button title="Se connecter" onPress={handleSubmit(onSubmit)} />
          <View className="flex-row justify-center gap-1">
            <Text className="text-base text-zinc-600">
              Pas encore de compte ?
            </Text>
            <Link
              href="./register"
              className="text-base font-semibold text-green-700"
            >
              S'inscrire
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
