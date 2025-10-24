import { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { theme } from "../lib/theme";

export default function GlassCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md
        },
        theme.shadow.card,
        style
      ]}
    >
      {children}
    </View>
  );
}
