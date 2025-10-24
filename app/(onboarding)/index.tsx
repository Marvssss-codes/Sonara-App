import { useEffect, useRef } from "react";
import { View, Text, Image, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import BackButton from "../../components/BackButton";
import Button from "../../components/Button";
import { theme } from "../../lib/theme";

const { width } = Dimensions.get("window");

const discs = [
  require("../../assets/onboarding/disc1.png"),
  require("../../assets/onboarding/disc2.png"),
  require("../../assets/onboarding/disc3.png"),
  require("../../assets/onboarding/disc4.png"),
  require("../../assets/onboarding/disc5.png"),
];

export default function Onboarding() {
  // floating animation
  const floats = useRef(discs.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    floats.forEach((val, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: 2800 + i * 200, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 2800 + i * 200, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* blurred gradient backdrop */}
      <LinearGradient
        colors={["#0E0F13", "#121428", "#131636"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      {/* Discs row */}
      <View style={{ position: "absolute", top: 100, width: "100%", alignItems: "center" }}>
        <View style={{ flexDirection: "row", gap: 16 }}>
          {discs.map((src, i) => {
            const translateY = floats[i].interpolate({ inputRange: [0, 1], outputRange: [0, i % 2 ? -10 : 10] });
            return (
              <Animated.View key={i} style={{ transform: [{ translateY }], opacity: 0.85 }}>
                <Image source={src} style={{ width: width * 0.22, height: width * 0.22, borderRadius: 999 }} />
              </Animated.View>
            );
          })}
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md, justifyContent: "flex-end", paddingBottom: theme.spacing.xl }}>
        <Text style={{ color: theme.colors.textSoft, letterSpacing: 2, marginBottom: 6 }}>SONARA</Text>
        <Text style={{ color: theme.colors.text, fontSize: 34, fontWeight: "700", lineHeight: 40 }}>
          Listen to the <Text style={{ color: theme.colors.primary2 }}>Best Music</Text>{"\n"}Everyday
        </Text>

        <Link href="/(auth)/login" asChild>
          <Button title="Let’s Get Started" style={{ marginTop: theme.spacing.lg }} />
        </Link>

        <Text style={{ color: theme.colors.textSoft, marginTop: 10, opacity: 0.7 }}>Version 1.2.1</Text>
      </View>
    </View>
  );
}
