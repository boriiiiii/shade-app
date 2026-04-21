import { View, Text, Image } from "react-native";

interface WelcomeSlide1Props {}

export default function WelcomeSlide1({}: WelcomeSlide1Props) {
  return (
    <View className="flex-1 justify-center items-center p-8 mt-16">
      <View className="relative">
        <Image
          source={require("../../assets/shade-icon.png")}
          className="w-[300px] h-[432px]"
        />
        <Text className="text-[30px] text-text-primary text-center leading-relaxed font-satoshi absolute top-7 left-0 right-0">
          Welcome to
        </Text>
      </View>
    </View>
  );
}
