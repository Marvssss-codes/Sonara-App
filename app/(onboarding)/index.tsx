import { useEffect, useRef } from "react";
import { View, Text, Image, Animated, Dimensions, ImageBackground, SafeAreaView } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const DISC = width * 0.22;

const discs = [
  require("../../assets/onboarding/disc1.png"),
  require("../../assets/onboarding/disc2.png"),
  require("../../assets/onboarding/disc3.png"),
  require("../../assets/onboarding/disc4.png"),
  require("../../assets/onboarding/disc5.png"),
];

function CTAButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <View style={{ borderRadius: 999, overflow: "hidden" }}>
      <LinearGradient
        colors={["#8E59FF", "#C07CFF"]}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={{ paddingVertical: 16, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>{title}</Text>
      </LinearGradient>
    </View>
  );
}

export default function Onboarding() {
  const floats = useRef(discs.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    floats.forEach((v, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 2600 + i * 180, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 2600 + i * 180, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0E17" }}>
      {/* Subtle vertical stripes behind everything (optional). Put your file at assets/onboarding/stripes.png or comment ImageBackground out */}
      <ImageBackground
        source={require("../../assets/onboarding/stripes.png")}
        resizeMode="cover"
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: 0.25 }}
      />

      {/* Disc belt across the center */}
      <View style={{ position: "absolute", top: height * 0.23, width: "100%", alignItems: "center" }}>
        <View style={{ flexDirection: "row", columnGap: 14 }}>
          {discs.map((src, i) => {
            const translateY = floats[i].interpolate({ inputRange: [0, 1], outputRange: [0, i % 2 ? -10 : 10] });
            return (
              <Animated.View key={i} style={{ transform: [{ translateY }], opacity: 0.95 }}>
                <Image source={src} style={{ width: DISC, height: DISC, borderRadius: DISC }} />
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Headline & CTA pinned near bottom and centered horizontally */}
      <View style={{ flex: 1, justifyContent: "flex-end", paddingHorizontal: 20, paddingBottom: 40 }}>
        <Text style={{ color: "#B7BCD3", letterSpacing: 2, marginBottom: 6 }}>SONARA</Text>
        <Text style={{ color: "#fff", fontSize: 34, fontWeight: "900", lineHeight: 40 }}>
          Listen to the <Text style={{ color: "#C07CFF" }}>Best Music</Text>{"\n"}Everyday
        </Text>

        <Link href="/(auth)/login" asChild>
          <View style={{ marginTop: 22 }}>
            <CTAButton title="Let's Get Started" onPress={() => {}} />
          </View>
        </Link>

        <Text style={{ color: "#B7BCD3", marginTop: 10, opacity: 0.7, fontSize: 12, textAlign: "center" }}>
          Version 1.2.1
        </Text>
      </View>
    </SafeAreaView>
  );
}
