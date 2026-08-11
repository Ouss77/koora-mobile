import { View, Text } from 'react-native';
import { Pencil } from 'lucide-react-native';

function getInitials(username: string): string {
  return username.trim().slice(0, 2).toUpperCase();
}

export function ProfileAvatar({ username }: { username: string }) {
  return (
    <View className="h-28 w-28 items-center justify-center rounded-full bg-green-50 ring-4 ring-white">
      <View
        className="h-full w-full items-center justify-center rounded-full border-2 border-green-200 bg-green-100"
        style={{
          elevation: 3,
          shadowColor: '#065f46',
          shadowOpacity: 0.15,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        }}
      >
        <Text className="font-poppins-black text-3xl text-green-700">
          {getInitials(username)}
        </Text>
      </View>

      <View
        className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-green-700"
        style={{
          elevation: 4,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Pencil size={14} color="#ffffff" strokeWidth={2.5} />
      </View>
    </View>
  );
}
