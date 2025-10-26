import { View, Text, ImageBackground } from "react-native";
import BackButton from "./BackButton";

export default function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ height: 260, backgroundColor: "#0F1330", overflow: "hidden" }}>
      {/* pointerEvents=none ensures BackButton stays clickable */}
      <ImageBackground
        source={require("../assets/auth/hero.png")}
        pointerEvents="none"
        resizeMode="cover"
        style={{ position: "absolute", inset: 0, opacity: 0.9 }}
      />
      <BackButton />
      <View style={{ position: "absolute", left: 20, bottom: 18, right: 20 }}>
        <Text style={{ color: "#B7BCD3", fontWeight: "700", letterSpacing: 1 }}>SONARA</Text>
        <Text style={{ color: "#fff", fontSize: 26, fontWeight: "900", marginTop: 4 }}>{title}</Text>
        {!!subtitle && <Text style={{ color: "#B7BCD3", marginTop: 4 }}>{subtitle}</Text>}
      </View>
    </View>
  );
}
