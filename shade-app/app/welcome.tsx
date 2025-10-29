import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import {
  WelcomeSlide1,
  WelcomeSlide2,
  WelcomeSlide3,
  WelcomeSlide4,
} from "../components/welcome";
import Feather from "@expo/vector-icons/Feather";
import { LAYOUT } from "@/lib/constants";

/**
 * Écran de bienvenue avec carrousel horizontal
 * Affiche 4 slides explicatives avec pagination
 */
export default function WelcomeScreen() {
  // État pour suivre la slide actuellement visible
  const [currentIndex, setCurrentIndex] = useState(0);

  // Récupère la largeur de l'écran pour calculer les dimensions du carrousel
  const screenWidth = Dimensions.get("window").width;

  // Liste des composants de slides pour le carrousel
  const welcomeSlides = [
    <WelcomeSlide1 key="welcome1" />,
    <WelcomeSlide2 key="welcome2" />,
    <WelcomeSlide3 key="welcome3" />,
    <WelcomeSlide4 key="welcome4" />,
  ];

  /**
   * Gère le scroll horizontal du carrousel
   * Calcule l'index de la slide visible en fonction du défilement
   * @param event - Événement de scroll natif contenant la position
   */
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    // Calcul basé sur la largeur d'écran moins le padding horizontal
    const paddingTotal = LAYOUT.screenPaddingHorizontal * 2;
    const index = Math.round(contentOffsetX / (screenWidth - paddingTotal));
    setCurrentIndex(index);
  };

  const paddingTotal = LAYOUT.screenPaddingHorizontal * 2;

  return (
    <View
      className="flex-1 pb-[21px] pt-[60px] bg-primary"
      style={{ paddingHorizontal: LAYOUT.screenPaddingHorizontal }}
    >
      <View className="flex-1 bg-primary">
        <View className="flex-1">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            className="flex-1"
            contentContainerStyle={{
              width: (screenWidth - paddingTotal) * welcomeSlides.length,
            }}
          >
            {welcomeSlides.map((slide, index) => (
              <View
                key={index}
                className="justify-center items-center"
                style={{ width: screenWidth - paddingTotal }}
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
                  index === currentIndex ? "bg-text-primary" : "bg-gray-400"
                }`}
              />
            ))}
          </View>
        </View>
        <View
          className="w-full"
          style={{ marginBottom: LAYOUT.actionButtonsBottom }}
        >
          <View className="flex-row gap-md">
            <Pressable
              className="flex-1 px-lg py-lg rounded-xl bg-cards"
              onPress={() => router.push("/sign_up")}
            >
              <Text className="text-text-primary text-center text-xl font-satoshi">
                Sign in
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 px-lg py-lg rounded-xl bg-cards"
              onPress={() => router.push("/login")}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Feather name="log-in" size={24} color="#6283FA" />
                <Text className="text-text-primary text-xl font-satoshi">
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
