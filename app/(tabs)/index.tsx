import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
    return (
    <View className="flex-1 items-center justify-center bg-primary p-md">
      <Text className="text-xl font-bold text-text-primary mb-xl">
        Welcome to Nativewind! INDEX
      </Text>
      
      <View className="gap-md w-full max-w-xs">
        <Pressable 
          className="bg-secondary px-lg py-md rounded-lg"
          onPress={() => router.push('/profile')}
        >
          <Text className="text-text-primary font-semibold text-center">
            Profile (Sans bottom nav)
          </Text>
        </Pressable>
        
        <Pressable 
          className="bg-cards px-lg py-md rounded-lg"
          onPress={() => router.push('/settings')}
        >
          <Text className="text-text-primary font-semibold text-center">
            Settings (Sans bottom nav)
          </Text>
        </Pressable>
        
        <Pressable 
          className="bg-validation px-lg py-md rounded-lg"
          onPress={() => router.push('/modal')}
        >
          <Text className="text-primary font-semibold text-center">
            Modal
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
