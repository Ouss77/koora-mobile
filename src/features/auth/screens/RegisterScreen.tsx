import { View, Text } from "react-native";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Logo } from "@/shared/ui/Logo";
import { Screen } from "@/shared/ui/Screen";
import { registerSchema, RegisterFormData } from "../schemas/registerSchema";
import { useRegister } from "../hooks/useRegister";

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
    mutate(data, {
      onSuccess: () => {
        router.replace("/"); // redirection temporaire — Task 11/12 gèreront ça proprement
      },
    });
  };

  return (
    <Screen contentClassName="justify-center">
      <View className="gap-10">
        <Logo subtitle="Create your KOORA account" />

        <View className="gap-4">
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                label="Username"
                placeholder="Enter your username"
              />
            )}
          />
          {errors.username && <Text className="text-red-500 text-sm">{errors.username.message}</Text>}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                label="Email"
                placeholder="Enter your email"
              />
            )}
          />
          {errors.email && <Text className="text-red-500 text-sm">{errors.email.message}</Text>}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input value={value} onChangeText={onChange} label="Password" secureTextEntry />
            )}
          />
          {errors.password && <Text className="text-red-500 text-sm">{errors.password.message}</Text>}

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input value={value} onChangeText={onChange} label="Confirm Password" secureTextEntry />
            )}
          />
          {errors.confirmPassword && (
            <Text className="text-red-500 text-sm">{errors.confirmPassword.message}</Text>
          )}
        </View>

        {/* Task 13 affinera l'affichage des erreurs métier (AuthError) */}
        {error && <Text className="text-red-500 text-sm text-center">{error.message}</Text>}

        <View className="gap-5">
          <Button
            title={isPending ? "Loading..." : "Register"}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
          />
          <View className="flex-row justify-center gap-1">
            <Text className="text-base text-zinc-600">Already have an account?</Text>
            <Link href="/login" className="text-base font-semibold text-green-700">
              Login
            </Link>
          </View>
        </View>
      </View>
    </Screen>
  );
}