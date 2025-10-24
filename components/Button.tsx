import { Pressable, Text, ViewStyle } from "react-native";
import { theme } from "../lib/theme";

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: "primary" | "outline" | "ghost";
  disabled?: boolean;
};

export default function Button({
  title,
  onPress,
  style,
  variant = "primary",
  disabled = false,
}: Props) {
  const base: ViewStyle = {
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: variant === "outline" ? 1 : 0,
    borderColor: theme.colors.primary,
    backgroundColor:
      variant === "primary" ? (disabled ? "#9fb0ff" : theme.colors.primary) : "transparent",
  };

  const textColor =
    variant === "primary" ? "#fff" : variant === "ghost" ? theme.colors.text : theme.colors.primary;

  return (
    <Pressable disabled={disabled} onPress={onPress} style={[base, style]}>
      <Text style={{ color: textColor, fontWeight: "700" }}>{title}</Text>
    </Pressable>
  );
}
