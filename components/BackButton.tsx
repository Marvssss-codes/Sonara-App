import { useRouter } from "expo-router";
import { Pressable, View, Text } from "react-native";
import { theme } from "../lib/theme";

export default function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      style={{
        position: "absolute",
        left: theme.spacing.md,
        top: theme.spacing.lg,
        zIndex: 20,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.06)",
      }}
    >
      <View style={{ width: 6, height: 6, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: theme.colors.text, transform: [{ rotate: "45deg" }], marginRight: 8 }} />
      <Text style={{ color: theme.colors.text }}>{label}</Text>
    </Pressable>
  );
}
