import { useEffect, useRef } from "react";
import { View, Text, Image, Animated, Dimensions, ImageBackground } from "react-native";
import { Link } from "expo-router";
import GradientButton from "../../components/GradientButton";

const { width } = Dimensions.get("window");
const DISC_SIZE = width * 0.22;

const discs = [
  require("../../assets/onboarding/disc1.png"),
  require("../../assets/onboarding/disc2.png"),
  require("../../assets/onboarding/disc3.png"),
  require("../../assets/onboarding/disc4.png"),
  require("../../assets/onboarding/disc5.png"),
];

export default function Onboarding() {
  const floats = useRef(discs.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    floats.forEach((val, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: 2600 + i * 180, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 2600 + i * 180, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View className="flex-1 bg-bg">
      {/* subtle stripes bg */}
      <ImageBackground
        source={require("../../assets/onboarding/stripes.png")}
        resizeMode="cover"
        className="absolute inset-0 opacity-30"
      />

      {/* disc belt */}
      <View className="absolute top-24 w-full items-center">
        <View className="flex-row space-x-4">
          {discs.map((src, i) => {
            const translateY = floats[i].interpolate({ inputRange: [0,1], outputRange: [0, i % 2 ? -10 : 10] });
            return (
              <Animated.View key={i} style={{ transform: [{ translateY }], opacity: 0.9 }}>
                <Image source={src} style={{ width: DISC_SIZE, height: DISC_SIZE, borderRadius: DISC_SIZE }} />
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* headline + CTA */}
      <View className="flex-1 justify-end px-5 pb-12">
        <Text className="text-textSoft tracking-wide2 mb-1">SONARA</Text>
        <Text className="text-text text-[34px] leading-[40px] font-extrabold">
          Listen to the <Text className="text-primary2">Best Music</Text>{"\n"}Everyday
        </Text>

        <Link href="/(auth)/login" asChild>
          <GradientButton title="Let's Get Started" style={{ marginTop: 22 }} />
        </Link>

        <Text className="text-textSoft mt-3 opacity-70 text-xs">Version 1.2.1</Text>
      </View>
    </View>
  );
}
