import { Text, TextInput, TextInputProps, View } from "react-native";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="gap-2">
      {label ? (
        <Text className="text-sm font-medium text-zinc-800">{label}</Text>
      ) : null}

      <TextInput
        className={`h-12 rounded-lg border bg-white px-4 text-base text-zinc-950 ${
          error ? "border-red-500" : "border-zinc-300"
        } ${className ?? ""}`}
        placeholderTextColor="#71717a"
        {...props}
      />

      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
