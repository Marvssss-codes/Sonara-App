import { TextInput, TextInputProps, View } from "react-native";
import { theme } from "../lib/theme";

export default function Input(props: TextInputProps) {
  return (
    <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md }}>
      <TextInput
        placeholderTextColor={theme.colors.muted}
        style={{ paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, color: theme.colors.text }}
        {...props}
      />
    </View>
  );
}
