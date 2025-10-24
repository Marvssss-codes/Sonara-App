import { View, Text, ImageBackground } from "react-native";
import BackButton from "./BackButton";
import { theme } from "../lib/theme";

export default function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ height: 220, backgroundColor: theme.colors.surface2 }}>
      <ImageBackground
        source={require("../assets/auth/hero.png")} // drop any png/jpg here (headphones photo)
        resizeMode="cover"
        style={{ flex: 1, opacity: 0.9 }}
      />
      <BackButton />
      <View style={{ position: "absolute", left: 16, bottom: 16, right: 16 }}>
        <Text style={{ color: theme.colors.textSoft, fontWeight: "600" }}>SONARA</Text>
        <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: "700" }}>{title}</Text>
        {!!subtitle && <Text style={{ color: theme.colors.textSoft, marginTop: 4 }}>{subtitle}</Text>}
      </View>
    </View>
  );
}
