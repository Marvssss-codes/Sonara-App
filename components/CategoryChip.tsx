import { Pressable, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function CategoryChip({
  label, active, onPress, style
}: { label: string; active?: boolean; onPress?: () => void; style?: ViewStyle }) {
  if (active) {
    return (
      <Pressable onPress={onPress} style={[{ borderRadius: 999, overflow: "hidden" }, style]}>
        <LinearGradient
          colors={["#8E59FF", "#C07CFF"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999 }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.18)",
          backgroundColor: "rgba(255,255,255,0.06)",
        },
        style,
      ]}
    >
      <Text style={{ color: "#fff", fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}
