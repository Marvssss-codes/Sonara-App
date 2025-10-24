import { View, Text } from "react-native";
import { theme } from "../lib/theme";

export default function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ paddingVertical: theme.spacing.sm }}>
      <Text style={{ fontSize: 20, fontWeight: "700", color: theme.colors.text }}>{title}</Text>
      {!!subtitle && <Text style={{ color: theme.colors.muted }}>{subtitle}</Text>}
    </View>
  );
}
