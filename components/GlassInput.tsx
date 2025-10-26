import { View, TextInput, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GlassInput({
  icon,
  ...props
}: TextInputProps & { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View
      style={{
        flexDirection: "row", alignItems: "center",
        borderRadius: 16, borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.06)",
        paddingHorizontal: 12
      }}
    >
      <Ionicons name={icon} size={18} color="#B7BCD3" />
      <TextInput
        placeholderTextColor="#B7BCD3"
        style={{ flex: 1, color: "#fff", paddingVertical: 12, paddingLeft: 8, fontSize: 16 }}
        {...props}
      />
    </View>
  );
}
