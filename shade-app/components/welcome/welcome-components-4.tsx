import { View, Text } from "react-native";
import { Lock } from "../icons";

interface WelcomeSlide4Props {}

export default function WelcomeSlide4({}: WelcomeSlide4Props) {
  return (
    <View className="flex-1">
      <View className="flex-1 justify-start mt-[15%]">
        <Text className="text-text-primary text-2xl font-satoshi leading-relaxed mb-[18px]">
          Connect multiple wallets
        </Text>

        <Text className="text-text-primary text-2xl font-satoshi leading-relaxed mb-[18px]">
          Visualise your statistics{"\n"}for each trade
        </Text>

        <Text className="text-text-primary text-2xl font-satoshi leading-relaxed mb-[18px]">
          Track your progress
        </Text>

        <Text className="text-text-primary text-2xl font-satoshi leading-relaxed mb-[18px]">
          Intuitive interface
        </Text>

        <Text className="text-text-primary text-2xl font-satoshi leading-relaxed mb-[18px]">
          No data collected
        </Text>

        <View className="flex-row items-center">
          <Lock />
          <Text className="text-text-primary text-2xl font-satoshi leading-relaxed ml-[10px]">
            Secure trades
          </Text>
        </View>
      </View>

      <View className="items-center">
        <Text className="text-text-primary text-xl font-satoshi mb-[51px]">
          Sign up now
        </Text>
      </View>
    </View>
  );
}
