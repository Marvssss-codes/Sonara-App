import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, ViewStyle } from "react-native";

export default function GradientButton({
  title, onPress, style, disabled=false
}: { title: string; onPress?: () => void; style?: ViewStyle; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[{ borderRadius: 999 }, style]}>
      <LinearGradient
        colors={["#8E59FF", "#C07CFF"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        className="rounded-pill items-center justify-center"
        style={{ paddingVertical: 16 }}
      >
        <Text className="text-white font-extrabold">{disabled ? "..." : title}</Text>
      </LinearGradient>
    </Pressable>
  );
}
