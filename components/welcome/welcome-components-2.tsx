import { View, Text } from "react-native";
import { CopySnipping } from "../icons";

interface WelcomeSlide2Props {}

export default function WelcomeSlide2({}: WelcomeSlide2Props) {
  return (
    <View className="flex-1 justify-center items-center p-8 mt-16">
      <View>
        <Text className="text-white text-[28px] text-center font-light font-satoshi">
          Copytrading and
        </Text>
        <Text className="text-white text-[28px] text-center font-light mb-[20px] font-satoshi">
          snipping
        </Text>
      </View>
      <View className="relative">
        <View className="flex-row items-center justify-center gap-2 z-10">
          <Text className="text-white text-[28px] font-light font-satoshi">
            made
          </Text>
          <Text className="text-white font-bold text-[28px] font-satoshi">
            easy
          </Text>
        </View>

        <View className="absolute right-32 -top-12">
          <CopySnipping />
        </View>
      </View>
      <View>
        <Text className="text-white font-light mt-[100px] font-satoshi">
          no more telegram bot
        </Text>
      </View>
    </View>
  );
}
