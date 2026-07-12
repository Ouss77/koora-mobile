import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Logo } from "@/shared/ui/Logo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { AuthPage } from "../components/AuthPage";
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
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (data: LoginFormData) => {
    mutate(data, { onSuccess: () => router.replace("/home") });
  };

  return (
    <AuthPage>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-1 justify-center px-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-8">
            <Logo subtitle="Bon retour sur KOORA" />
          </View>

          {/* Carte semi-opaque : cohérence avec RegisterScreen */}
          <View className="bg-white/95 rounded-3xl p-6 gap-4 shadow-lg">
            <View>
              <Text className="text-sm font-medium text-zinc-700 mb-1">Pseudo</Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="Entre ton pseudo"
                    textContentType="username"
                  />
                )}
              />
              {errors.username && (
                <Text className="text-red-500 text-sm mt-1">{errors.username.message}</Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-zinc-700 mb-1">Mot de passe</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="Entre ton mot de passe"
                    secureTextEntry
                    textContentType="password"
                  />
                )}
              />
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>
              )}
            </View>

            {error && (
              <Text className="text-red-500 text-sm text-center">{error.message}</Text>
            )}

            <Button
              title={isPending ? "Connexion..." : "Se connecter"}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            />
          </View>

          <View className="flex-row justify-center gap-1 mt-6">
            <Text className="text-base text-white font-medium">Pas encore de compte ?</Text>
            <Link href="/register" className="text-base font-bold text-green-400">
              S&apos;inscrire
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthPage>
  );
}