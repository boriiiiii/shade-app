import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { WelcomeSlide1, WelcomeSlide2, WelcomeSlide3, WelcomeSlide4 } from "../components/welcome";
import Feather from '@expo/vector-icons/Feather';


export default function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  
  // Composants TSX pour le carrousel
  const welcomeSlides = [
    <WelcomeSlide1 key="welcome1" />,
    <WelcomeSlide2 key="welcome2" />,
    <WelcomeSlide3 key="welcome3" />,
    <WelcomeSlide4 key="welcome4" />
  ];

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (screenWidth - 42)); // 42 = padding horizontal total (21px * 2)
    setCurrentIndex(index);
  };

  return (
    <View className="flex-1 px-[21px] pb-[21px] pt-[60px] bg-primary">
      <View className="flex-1 bg-primary">
        <View className="flex-1">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            className="flex-1"
          >
            {welcomeSlides.map((slide, index) => (
              <View
                key={index}
                style={{ width: screenWidth - 42 }}
                className="justify-center items-center"
              >
                {slide}
              </View>
            ))}
          </ScrollView>
    
          <View className="flex-row justify-center items-center mt-lg mb-lg">
            {welcomeSlides.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentIndex ? 'bg-text-primary' : 'bg-gray-400'
                }`}
              />
            ))}
          </View>
        </View>
        <View className="w-full" style={{ marginBottom: 62 }}>
          <View className="flex-row gap-md">
            <Pressable
              className="flex-1 px-lg py-lg rounded-xl"
              style={{ backgroundColor: "#2A2A2A" }}
              onPress={() => router.push("/sign_up")}
            >
              <Text
                className="text-text-primary text-center text-xl"
                style={{ fontFamily: "Satoshi" }}
              >
                Sign in
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 px-lg py-lg rounded-xl"
              style={{ backgroundColor: "#2A2A2A" }}
              onPress={() => router.push("/login")}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Feather name="log-in" size={24} color="#6283FA" />
                <Text
                  className="text-text-primary text-xl"
                  style={{ fontFamily: "Satoshi" }}
                >
                  Log in
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
