import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../lib/theme";

export default function BackButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      style={{
        position: "absolute",
        left: 16,
        top: 14,
        zIndex: 20,
        width: 40,
        height: 40,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: theme.colors.border
      }}
    >
      <Ionicons name="chevron-back" size={20} color="#fff" />
    </Pressable>
  );
}
