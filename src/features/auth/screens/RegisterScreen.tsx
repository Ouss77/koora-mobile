import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Logo } from "@/shared/ui/Logo";
import { Screen } from "@/shared/ui/Screen";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { RegisterFormData, registerSchema } from "../schemas/registerSchema";

export default function RegisterScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    console.log("Formulaire inscription valide:", data);
  };

  return (
    <Screen contentClassName="justify-center">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="gap-10"
      >
        <Logo subtitle="Cree ton compte KOORA" />

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
                placeholder="Choisis un pseudo"
                textContentType="username"
                error={errors.username?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                label="Mot de passe"
                placeholder="Cree un mot de passe"
                secureTextEntry
                textContentType="newPassword"
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                label="Confirmer le mot de passe"
                placeholder="Saisis a nouveau ton mot de passe"
                secureTextEntry
                textContentType="newPassword"
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </View>

        <View className="gap-5">
          <Button title="S'inscrire" onPress={handleSubmit(onSubmit)} />

          <View className="flex-row justify-center gap-1">
            <Text className="text-base text-zinc-600">Deja un compte ?</Text>
            <Link
              href="./login"
              className="text-base font-semibold text-green-700"
            >
              Se connecter
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
