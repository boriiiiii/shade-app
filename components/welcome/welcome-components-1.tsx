import { View, Text, Image } from "react-native";

export default function WelcomeSlide1() {
  return (
    <View className="flex-1 justify-center items-center p-8 mt-16">
      <View style={{ position: 'relative' }}>
        <Image 
          source={require('../../assets/shade-icon.png')}
          style={{ width: 300, height: 432 }}
        />
        <Text 
          className="text-[30px] text-white text-center leading-relaxed" 
          style={{ 
            fontFamily: "Satoshi",
            position: 'absolute',
            top: 28,
            left: 0,
            right: 0,
            textAlign: 'center'
          }}
        >
          Welcome to
        </Text>
      </View>
    </View>
  );
}
