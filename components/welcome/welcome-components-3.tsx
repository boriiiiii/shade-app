import { View, Text, Image } from "react-native";
import Metamask from "@/assets/metamask";
import Coinbase from "@/assets/coinbase";
import Binance from "@/assets/binance";
import Phantom from "@/assets/phantom";
import Bitcoin from "@/assets/bitcoin";
import Ethereum from "@/assets/etherum";
import Solana from "@/assets/solona";


// TO DO
// All png => SVG

export default function WelcomeSlide3() {
  return (
    <View className="flex-1 justify-center mt-[100px]">
      <Text className="text-white text-4xl text-center font-satoshi leading-tight">
        Connect your existing
      </Text>
      <Text className="text-white text-4xl text-center font-satoshi leading-tight mb-[23px]">
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

      <Text className="text-gray-400 text-lg text-center mb-[53px]">
        more coming soon
      </Text>

      <View className="mb-8">
        <Text className="text-white text-4xl text-center font-satoshi leading-tight mb-[16px]">
          and you are set
        </Text>
        <View className="flex-row justify-center items-center">
          <Text className="text-white font-satoshi text-4xl mr-4">to trade</Text>
          <View className="flex-row">
            <View className="w-14 h-14 rounded-full justify-center items-center mx-1">
              <Bitcoin/>
            </View>
            <View className="w-14 h-14rounded-full justify-center items-center mx-1">
              <Ethereum/>
            </View>
            <View className="w-14 h-14 rounded-full justify-center items-center mx-1">
              <Solana/>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
