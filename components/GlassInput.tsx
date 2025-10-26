import { View, TextInput, TextInputProps, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

type Props = TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
};

export default function GlassInput({ icon, secure = false, ...props }: Props) {
  const [show, setShow] = useState(false);
  const isSecure = secure && !show;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.06)",
        paddingHorizontal: 12,
      }}
    >
      <Ionicons name={icon} size={18} color="#B7BCD3" />
      <TextInput
        placeholderTextColor="#B7BCD3"
        style={{
          flex: 1,
          color: "#fff",
          paddingVertical: 12,
          paddingLeft: 8,
          fontSize: 16,
        }}
        secureTextEntry={isSecure}
        autoCapitalize={props.autoCapitalize ?? (secure ? "none" : undefined)}
        {...props}
      />

      {secure && (
        <Pressable
          onPress={() => setShow((s) => !s)}
          hitSlop={10}
          style={{ paddingLeft: 8, paddingVertical: 6 }}
        >
          <Ionicons name={show ? "eye-off" : "eye"} size={18} color="#B7BCD3" />
        </Pressable>
      )}
    </View>
  );
}
