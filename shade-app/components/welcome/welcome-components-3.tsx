import { View, Text, Image, Dimensions } from "react-native";

const { height: screenHeight } = Dimensions.get('window');
import {
  Metamask,
  Coinbase,
  Binance,
  Phantom,
  Bitcoin,
  Ethereum,
  Solana,
} from "../icons";

interface WelcomeSlide3Props {}

export default function WelcomeSlide3({}: WelcomeSlide3Props) {
  return (
    <View className="flex-1 justify-center" style={{ marginTop: screenHeight * 0.117 }}>
      <Text className="text-text-primary text-4xl text-center font-satoshi leading-tight">
        Connect your existing
      </Text>
      <Text className="text-text-primary text-4xl text-center font-satoshi leading-tight mb-[23px]">
        wallet(s)
      </Text>

      <View className="flex-row justify-center items-center mb-[17px]">
        <View className="w-16 h-16 bg-cards rounded-full justify-center items-center mx-1.5">
          <Metamask />
        </View>
        <View className="w-16 h-16 bg-cards rounded-full justify-center items-center mx-1.5">
          <Coinbase />
        </View>
        <View className="w-16 h-16 bg-cards rounded-full justify-center items-center mx-1.5">
          <Binance />
        </View>
        <View className="w-16 h-16 bg-cards rounded-full justify-center items-center mx-1.5">
          <Phantom />
        </View>
      </View>

      <Text className="text-text-primary font-satoshi text-lg text-center mb-[53px]">
        more coming soon
      </Text>

      <View className="mb-8">
        <Text className="text-text-primary text-4xl text-center font-satoshi leading-tight mb-[16px]">
          and you are set
        </Text>
        <View className="flex-row justify-center items-center">
          <Text className="text-text-primary font-satoshi text-4xl mr-4">
            to trade
          </Text>
          <View className="flex-row">
            <View className="w-14 h-14 rounded-full justify-center items-center mx-1">
              <Bitcoin />
            </View>
            <View className="w-14 h-14 rounded-full justify-center items-center mx-1">
              <Ethereum />
            </View>
            <View className="w-14 h-14 rounded-full justify-center items-center mx-1">
              <Solana />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
