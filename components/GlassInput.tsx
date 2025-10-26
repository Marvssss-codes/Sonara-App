// components/GlassInput.tsx
import { View, TextInput, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../lib/theme";

export default function GlassInput({
  icon,
  ...props
}: TextInputProps & { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.glass,
        paddingHorizontal: 12,
      }}
    >
      <Ionicons name={icon} size={18} color={theme.colors.textSoft} />
      <TextInput
        placeholderTextColor={theme.colors.textSoft}
        style={{
          flex: 1,
          color: theme.colors.text,
          paddingVertical: 12,
          paddingLeft: 8,
          fontSize: 16,
        }}
        {...props}
      />
    </View>
  );
}
