import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import BackIcon from "@/assets/back-icon";
import Coinbase from "@/assets/coinbase";
import Metamask from "@/assets/metamask";
import Binance from "@/assets/binance";
import Phantom from "@/assets/phantom";

// TO DO 
// REFAIRE LES PROPORTIONS => CALCUL POURCENTAGE => FIGMA THEN CODE

export default function sign_up() {
  return (
    <View className="flex-1 px-[21px] pb-[21px] pt-[60px] bg-red-400">
      <View className="flex-1 bg-primary">
        <View className="flex-1">
          <View className="flex-row items-center relative">
            <BackIcon width={20} height={20} />
            <View className="absolute left-0 right-0 items-center">
              <Text className="text-text-secondary font-satoshi text-xl">
                Sign Up
              </Text>
            </View>
          </View>
          <View className="mt-[126px] justify-center items-center">
            <Text className="text-white font-satoshi text-lg">You don't even need a new account</Text>
            <Text className="text-white font-satoshi text-2xl">
              Connect a wallet
            </Text>
            <Text className="text-text-secondary font-satoshi">
              you can connect more later
            </Text>

            <View className="w-4/5">
              <TouchableOpacity className="bg-[#2A2A2A] rounded-2xl px-6 py-4 flex-row items-center">
                <Coinbase />
                <Text className="text-white font-satoshi text-lg ml-4">
                  Coinbase
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-[#2A2A2A] rounded-2xl px-6 py-4 flex-row items-center mt-4">
                <Metamask />
                <Text className="text-white font-satoshi text-lg ml-4">
                  Metamask
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-[#2A2A2A] rounded-2xl px-6 py-4 flex-row items-center mt-4">
                <Binance />
                <Text className="text-white font-satoshi text-lg ml-4">
                  Binance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-[#2A2A2A] rounded-2xl px-6 py-4 flex-row items-center mt-4">
                <Phantom />
                <Text className="text-white font-satoshi text-lg ml-4">
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
