import { useRef, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  Dimensions,
  Pressable,
  ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// 3 slide images (use your real assets; duplicates are fine for now)
const slides: { image: ImageSourcePropType; title: string; subtitle: string }[] = [
  {
    image: require("../../assets/onboarding/slide1.png"),
    title: "Listen to the Best Music",
    subtitle: "Discover new tracks tailored to your generation.",
  },
  {
    image: require("../../assets/onboarding/slide2.png"),
    title: "Explore Every Generation",
    subtitle: "From Gen Alpha to Boomers — find your vibe.",
  },
  {
    image: require("../../assets/onboarding/slide3.png"),
    title: "Save Favorites & Playlists",
    subtitle: "Build your library and come back anytime.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const onViewableItemsChanged = (info: { viewableItems: Array<{ index?: number | null }> }) => {
    const i = info.viewableItems[0]?.index ?? 0;
    if (typeof i === "number") setIndex(i);
  };
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 60 });

  const goNext = () => {
    if (index < slides.length - 1) listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };
  const skipToEnd = () => listRef.current?.scrollToIndex({ index: slides.length - 1, animated: true });
  const getStarted = () => router.replace("/login"); // ✅ groups are not part of the path

  // Reserve consistent room for bottom controls + device inset
  const BUTTON_HEIGHT = 54;
  const BOTTOM_SPACING = 18;
  const CONTROLS_BLOCK = BUTTON_HEIGHT + BOTTOM_SPACING + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0E17" }}>
      {/* Slides */}
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <ImageBackground source={item.image} resizeMode="cover" style={{ flex: 1 }}>
              {/* Darken towards bottom; add padding so text NEVER collides with buttons */}
              <LinearGradient
                colors={["rgba(11,14,23,0.08)", "rgba(11,14,23,0.7)", "#0B0E17"]}
                start={{ x: 0.5, y: 0.1 }}
                end={{ x: 0.5, y: 1 }}
                style={{
                  flex: 1,
                  paddingHorizontal: 22,
                  paddingTop: insets.top + 10,
                  paddingBottom: CONTROLS_BLOCK + 28,
                  justifyContent: "flex-end",
                }}
              >
                <Text style={{ color: "#9FA8D3", letterSpacing: 2, marginBottom: 6, fontWeight: "800" }}>
                  SONARA
                </Text>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 34,
                    fontWeight: "900",
                    lineHeight: 40,
                    marginBottom: 6,
                  }}
                >
                  {item.title.replace("Music", "")}
                  <Text style={{ color: "#C07CFF" }}> Music</Text>
                </Text>
                <Text style={{ color: "#C9CDE6", fontSize: 15 }}>{item.subtitle}</Text>
              </LinearGradient>
            </ImageBackground>
          </View>
        )}
      />

      {/* Pagination + Actions — anchored with safe-area bottom */}
      <View
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          bottom: insets.bottom + 12, // 👈 platform-safe anchoring
          alignItems: "center",
        }}
        pointerEvents="box-none"
      >
        {/* Dots */}
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          {slides.map((_, i) => {
            const active = i === index;
            return (
              <View
                key={i}
                style={{
                  width: active ? 22 : 8,
                  height: 8,
                  borderRadius: 999,
                  marginHorizontal: 4,
                  backgroundColor: active ? "#C07CFF" : "rgba(255,255,255,0.38)",
                }}
              />
            );
          })}
        </View>

        {/* Buttons */}
        {index < slides.length - 1 ? (
          <View style={{ width: "100%", flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={skipToEnd}
              style={{
                flex: 1,
                height: BUTTON_HEIGHT,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.22)",
                backgroundColor: "rgba(255,255,255,0.07)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>Skip</Text>
            </Pressable>

            <Pressable
              onPress={goNext}
              style={{
                flex: 2,
                height: BUTTON_HEIGHT,
                borderRadius: 999,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LinearGradient
                colors={["#8E59FF", "#C07CFF"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ position: "absolute", inset: 0, borderRadius: 999 }}
              />
              <Text style={{ color: "#fff", fontWeight: "900" }}>Next</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={getStarted}
            style={{
              width: "100%",
              height: BUTTON_HEIGHT,
              borderRadius: 999,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LinearGradient
              colors={["#8E59FF", "#C07CFF"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ position: "absolute", inset: 0, borderRadius: 999 }}
            />
            <Text style={{ color: "#fff", fontWeight: "900" }}>Let’s Get Started</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
