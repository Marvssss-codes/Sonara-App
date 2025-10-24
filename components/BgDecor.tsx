import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { theme } from "../lib/theme";

export default function BgDecor() {
  return (
    <View style={{ position: "absolute", inset: 0 }}>
      <LinearGradient
        colors={["#0B0E17", "#0F1330"]}
        style={{ position: "absolute", inset: 0 }}
      />
      <LinearGradient
        colors={["rgba(142,89,255,0.35)", "transparent"]}
        style={{ position: "absolute", width: 240, height: 240, borderRadius: 200, right: -40, top: 80 }}
      />
      <LinearGradient
        colors={["rgba(70,230,166,0.25)", "transparent"]}
        style={{ position: "absolute", width: 220, height: 220, borderRadius: 200, left: -50, bottom: 80 }}
      />
    </View>
  );
}
