import { Pressable, Text, View } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

type Kind = "google" | "apple";

export default function SocialButton({
  kind,
  onPress,
}: {
  kind: Kind;
  onPress?: () => void;
}) {
  const label = kind === "google" ? "Continue with Google" : "Continue with Apple";
  const Icon = kind === "google" ? FontAwesome : Ionicons;
  const iconName = kind === "google" ? ("google" as const) : ("logo-apple" as const);

  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        backgroundColor: "rgba(255,255,255,0.06)",
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
      }}
    >
      <Icon name={iconName as any} size={18} color="#fff" />
      <Text style={{ color: "#fff", fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}
