import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: "#0B0E17", paddingTop: insets.top + 12, paddingHorizontal: 16 }}>
      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 22, marginBottom: 8 }}>Your Profile</Text>
      <Text style={{ color: "#B7BCD3" }}>We’ll style this page soon.</Text>
    </View>
  );
}
