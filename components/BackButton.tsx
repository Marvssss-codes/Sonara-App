import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BackButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        // @ts-ignore: canGoBack exists at runtime
        if (router.canGoBack?.()) router.back();
        else router.replace("/(onboarding)");
      }}
      style={{
        position: "absolute",
        left: 16, top: 14, zIndex: 50,
        width: 40, height: 40, borderRadius: 999,
        alignItems: "center", justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.10)",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.15)"
      }}
      hitSlop={10}
    >
      <Ionicons name="chevron-back" size={20} color="#fff" />
    </Pressable>
  );
}
