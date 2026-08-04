// src/shared/components/ComingSoon.tsx
import { View, Text } from 'react-native';

export default function ComingSoon({ label = 'Bientôt disponible' }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-slate-400 text-base font-medium">{label}</Text>
    </View>
  );
}