import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";

type TeamLogoProps = {
  logoUrl?: string;
  teamName: string;
  size?: "sm" | "md" | "lg";
};

const dimensions = { sm: 24, md: 32, lg: 48 } as const;

export function TeamLogo({ logoUrl, teamName, size = "md" }: TeamLogoProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(logoUrl));
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dimension = dimensions[size];
  const initial = teamName.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    setHasImageError(false);
    setIsLoading(Boolean(logoUrl));

    if (!logoUrl) return;
    loadingTimeoutRef.current = setTimeout(() => {
      setHasImageError(true);
      setIsLoading(false);
    }, 5_000);

    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, [logoUrl]);

  const finishLoading = () => {
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    setIsLoading(false);
  };

  if (!logoUrl || hasImageError) {
    return (
      <View
        className="items-center justify-center rounded-full border border-zinc-300 bg-zinc-200"
        style={{ width: dimension, height: dimension }}
      >
        <Text className="font-poppins-bold text-xs text-zinc-700">{initial}</Text>
      </View>
    );
  }

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-white"
      style={{ width: dimension, height: dimension }}
    >
      <Image
        source={{ uri: logoUrl }}
        style={{ width: dimension, height: dimension }}
        resizeMode="contain"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={finishLoading}
        onError={() => {
          finishLoading();
          setHasImageError(true);
        }}
        accessibilityLabel={`Logo ${teamName}`}
      />
      {isLoading ? (
        <View className="absolute inset-0 items-center justify-center bg-white/70">
          <ActivityIndicator size="small" color="#52525b" />
        </View>
      ) : null}
    </View>
  );
}
