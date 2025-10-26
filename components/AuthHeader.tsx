// components/AuthHeader.tsx
import { View, Text, ImageBackground } from "react-native";
import BackButton from "./BackButton";
import { theme } from "../lib/theme";

export default function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ height: 240, backgroundColor: theme.colors.bg2, overflow: "hidden" }}>
      <ImageBackground
        source={require("../assets/auth/hero.png")}
        resizeMode="cover"
        style={{ flex: 1, opacity: 0.9 }}
      />
      <BackButton />
      <View style={{ position: "absolute", left: 20, bottom: 18, right: 20 }}>
        <Text style={{ color: theme.colors.textSoft, fontWeight: "700", letterSpacing: 1 }}>SONARA</Text>
        <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: "900", marginTop: 4 }}>{title}</Text>
        {!!subtitle && <Text style={{ color: theme.colors.textSoft, marginTop: 4 }}>{subtitle}</Text>}
      </View>
    </View>
  );
}
