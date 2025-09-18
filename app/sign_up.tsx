import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import BackIcon from "@/assets/back-icon";
import Coinbase from "@/assets/coinbase";
import Metamask from "@/assets/metamask";
import Binance from "@/assets/binance";
import Phantom from "@/assets/phantom";


// TO DO 
// REFAIRE LES PROPORTIONS => CALCUL POURCENTAGE => FIGMA THEN CODE

export default function sign_up() {
    const router = useRouter();
  
    const handleGoBack = () => {
      router.back();
    };

  return (
    <View className="flex-1 px-[21px] pb-[21px] pt-[60px] bg-red-400">
      <View className="flex-1 bg-primary">
        <View className="flex-1">
          <View className="flex-row items-center relative">
            <TouchableOpacity onPress={handleGoBack}>
              <BackIcon width={20} height={20} />
            </TouchableOpacity>
            <View className="absolute left-0 right-0 items-center">
              <Text className="text-text-secondary font-satoshi text-xl">
                Sign up
              </Text>
            </View>
          </View>
          <View className="mt-[126px] justify-center items-center">
            <Text className="text-white font-satoshi text-xl">
              You don't even need an account
            </Text>
            <Text className="text-white font-satoshi text-3xl mt-[16px]">
              Connect a wallet
            </Text>
            <Text className="text-text-secondary font-satoshi font-light mt-[16px] mb-[40px] text-xl">
              you can connect more later
            </Text>
            <View className="w-[85%]">
              <TouchableOpacity className="bg-[#2A2A2A] rounded-3xl px-6 h-[60px] flex-row items-center">
                <Coinbase width={28} height={28} />
                <Text className="text-white font-satoshi font-medium text-xl ml-4">
                  Coinbase
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-[#2A2A2A] rounded-3xl px-6 h-[60px] flex-row items-center mt-[20px]">
                <Metamask width={28} height={28} />
                <Text className="text-white font-satoshi font-medium text-xl ml-4">
                  Metamask
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-[#2A2A2A] rounded-3xl px-6 h-[60px] flex-row items-center mt-[20px]">
                <Binance width={28} height={28} />
                <Text className="text-white font-satoshi font-medium text-xl ml-4">
                  Binance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-[#2A2A2A] rounded-3xl px-6 h-[60px] flex-row items-center mt-[20px]">
                <Phantom width={28} height={28} />
                <Text className="text-white font-satoshi font-medium text-xl ml-4">
                  Phantom
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
