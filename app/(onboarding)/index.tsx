import { useEffect, useRef } from "react";
import { View, Text, Image, Animated, Dimensions } from "react-native";
import { Link } from "expo-router";
import GradientButton from "../../components/GradientButton";
import BgDecor from "../../components/BgDecor";
import { theme } from "../../lib/theme";

const { width } = Dimensions.get("window");

// if you don't have discs yet, comment this array and the map below
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
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <BgDecor />

      {/* floating discs */}
      <View style={{ position: "absolute", top: 100, width: "100%", alignItems: "center" }}>
        <View style={{ flexDirection: "row", gap: 14 }}>
          {discs.map((src, i) => {
            const translateY = floats[i].interpolate({ inputRange: [0, 1], outputRange: [0, i % 2 ? -8 : 8] });
            return (
              <Animated.View key={i} style={{ transform: [{ translateY }], opacity: 0.9 }}>
                <Image source={src} style={{ width: width * 0.2, height: width * 0.2, borderRadius: 200 }} />
              </Animated.View>
            );
          })}
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: "flex-end", paddingHorizontal: 20, paddingBottom: 44 }}>
        <Text style={{ color: theme.colors.textSoft, letterSpacing: 2, marginBottom: 6 }}>SONARA</Text>
        <Text style={{ color: theme.colors.text, fontSize: 36, fontWeight: "900", lineHeight: 42 }}>
          Listen to the <Text style={{ color: theme.colors.primary2 }}>Best Music</Text>{"\n"}Everyday
        </Text>

        <Link href="/(auth)/login" asChild>
          <GradientButton title="Let’s Get Started" style={{ marginTop: 20 }} />
        </Link>

        <Text style={{ color: theme.colors.textSoft, marginTop: 10, opacity: 0.7, fontSize: 12 }}>Version 1.2.1</Text>
      </View>
    </View>
  );
}
