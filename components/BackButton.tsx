import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";

export default function BackButton() {
  const router = useRouter();
  const locked = useRef(false);

  const handlePress = () => {
    if (locked.current) return;
    locked.current = true;
    // Prefer going back, otherwise go to onboarding
    try {
      // @ts-ignore runtime has canGoBack
      if (router.canGoBack?.()) router.back();
      else router.replace("/(onboarding)");
    } finally {
      setTimeout(() => (locked.current = false), 350);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        position: "absolute",
        left: 16,
        top: 14,
        zIndex: 60,
        width: 44,
        height: 44,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
      }}
      hitSlop={20}
      android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: true }}
    >
      <Ionicons name="chevron-back" size={22} color="#fff" />
    </Pressable>
  );
}
