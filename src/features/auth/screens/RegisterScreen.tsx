import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Logo } from "@/shared/ui/Logo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { AuthPage } from "../components/AuthPage";
import { useRegister } from "../hooks/useRegister";
import { RegisterFormData, registerSchema } from "../schemas/registerSchema";

export default function RegisterScreen() {
  const router = useRouter();
  const { mutate, isPending, error } = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (data: RegisterFormData) => {
    mutate(data, { onSuccess: () => router.replace("/") });
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
            <Logo subtitle="Create your KOORA account" />
          </View>

          {/* Carte semi-opaque : règle la lisibilité quelle que soit l'image de fond */}
          <View className="bg-white/95 rounded-3xl p-6 gap-4 shadow-lg">
            <View>
              <Text className="text-sm font-medium text-zinc-700 mb-1">Username</Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    placeholder="Enter your username"
                  />
                )}
              />
              {errors.username && (
                <Text className="text-red-500 text-sm mt-1">{errors.username.message}</Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-zinc-700 mb-1">Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Enter your email"
                  />
                )}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-zinc-700 mb-1">Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input value={value} onChangeText={onChange} secureTextEntry placeholder="••••••••" />
                )}
              />
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-zinc-700 mb-1">Confirm Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <Input value={value} onChangeText={onChange} secureTextEntry placeholder="••••••••" />
                )}
              />
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</Text>
              )}
            </View>

            {error && (
              <Text className="text-red-500 text-sm text-center">{error.message}</Text>
            )}

            <Button
              title={isPending ? "Loading..." : "Register"}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            />
          </View>

          <View className="flex-row justify-center gap-1 mt-6">
            <Text className="text-base text-white font-medium">Already have an account?</Text>
            <Link href="/login" className="text-base font-bold text-green-400">
              Login
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthPage>
  );
}