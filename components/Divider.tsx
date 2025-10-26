import { View, Text } from "react-native";

export default function Divider({ text = "OR" }: { text?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 14 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
      <Text style={{ color: "rgba(255,255,255,0.7)", fontWeight: "700" }}>{text}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
    </View>
  );
}
