import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Logo } from "@/shared/ui/Logo";
import { Screen } from "@/shared/ui/Screen";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";

import { useLogin } from "../hooks/useLogin";
import { LoginFormData, loginSchema } from "../schemas/loginSchema";

export default function LoginScreen() {
  const router = useRouter();

  const { mutate, isPending, error } = useLogin();

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
    mutate(data, {
      onSuccess: () => {
        router.replace("/");
      },
    });
  };

  return (
    <Screen contentClassName="justify-center">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="gap-10"
      >
        <Logo subtitle="Bon retour sur KOORA" />

        <View className="gap-4">
          {/* Username */}
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

          {/* Password */}
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

        {/* Authentication error */}
        {error && (
          <Text className="text-red-500 text-sm text-center">
            {error.message}
          </Text>
        )}

        <View className="gap-5">
          <Button
            title={isPending ? "Connexion..." : "Se connecter"}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
          />

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