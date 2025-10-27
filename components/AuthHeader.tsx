// components/AuthHeader.tsx
import { View, Text } from "react-native";
import BackButton from "./BackButton";
import SafeImage from "./SafeImage";

export default function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ height: 260, backgroundColor: "#0F1330", overflow: "hidden" }}>
      {/* Background image (static require). If you don't have the file, set src={null}. */}
      <SafeImage
        src={require("../assets/auth/hero.png") as any}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: 0.9 }}
        contentFit="cover"
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
