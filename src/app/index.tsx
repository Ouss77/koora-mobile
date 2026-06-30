import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-3xl font-bold text-blue-600">
          KOORA
        </Text>
        <Text className="mt-4 text-gray-600">
          Application de pronostics football
        </Text>
        <View className="mt-8 bg-red-500 px-4 py-2 rounded-lg">
          <Text className="text-white">✅ NativeWind fonctionne</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}