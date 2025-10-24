import { View, Text, Image } from "react-native";
import { Link } from "expo-router";
import Button from "../../components/Button";
import Screen from "../../components/Screen";
import { theme } from "../../lib/theme";

export default function Onboarding() {
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: theme.spacing.md }}>
        {/* Replace with your logo asset when ready */}
        {/* <Image source={require("../../assets/logo.png")} style={{ width: 96, height: 96 }} /> */}
        <Text style={{ color: theme.colors.text, fontSize: 36, fontWeight: "700" }}>Sonara</Text>
        <Text style={{ color: theme.colors.muted, textAlign: "center", fontSize: 16, paddingHorizontal: theme.spacing.md }}>
          Discover music by your generation. Explore Gen Alpha, Gen Z, Millennials, Gen X & Boomers.
        </Text>

        <View style={{ width: "100%", marginTop: theme.spacing.lg }}>
          <Link href="/(auth)/login" asChild>
            <Button title="Get Started" />
          </Link>
        </View>

        <Text style={{ color: theme.colors.muted, marginTop: theme.spacing.sm, fontSize: 12 }}>
          No account? You can sign up on the next screen.
        </Text>
      </View>
    </Screen>
  );
}
