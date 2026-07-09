import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
};

const buttonClasses: Record<ButtonVariant, string> = {
  primary: "bg-green-600",
  secondary: "bg-zinc-900",
  ghost: "bg-transparent border border-zinc-300",
};

const textClasses: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-white",
  ghost: "text-zinc-900",
};

export function Button({
  title,
  variant = "primary",
  isLoading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      className={`h-12 items-center justify-center rounded-lg px-4 ${buttonClasses[variant]} ${
        isDisabled ? "opacity-60" : "active:opacity-80"
      } ${className ?? ""}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "ghost" ? "#18181b" : "#ffffff"} />
      ) : (
        <Text className={`text-base font-semibold ${textClasses[variant]}`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
