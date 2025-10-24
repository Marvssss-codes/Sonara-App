import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, ViewStyle } from "react-native";
import { theme } from "../lib/theme";

export default function GradientButton({
  title,
  onPress,
  style,
  disabled = false
}: { title: string; onPress?: () => void; style?: ViewStyle; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[{ borderRadius: theme.radius.pill }, style]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary2]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[
          {
            paddingVertical: 14,
            paddingHorizontal: 22,
            borderRadius: theme.radius.pill,
            alignItems: "center",
            justifyContent: "center",
          },
          theme.shadow.glow
        ]}
      >
        <Text style={{ color: "#fff", fontWeight: "800", letterSpacing: 0.4 }}>{disabled ? "..." : title}</Text>
      </LinearGradient>
    </Pressable>
  );
}
