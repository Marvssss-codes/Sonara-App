import { View, Text, Image, Pressable, ViewStyle } from "react-native";

export default function PlaylistPill({
  title,
  image,
  onPress,
  style
}: {
  title: string;
  image?: string | null;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable onPress={onPress} style={[{ width: "48%", height: 64, borderRadius: 14, overflow:"hidden", backgroundColor:"#1A2136", flexDirection:"row", alignItems:"center" }, style]}>
      <Image
        source={{ uri: image || "https://placehold.co/80x80/111/FFF.png?text=PL" }}
        style={{ width: 64, height: 64 }}
      />
      <Text numberOfLines={1} style={{ color:"#fff", fontWeight:"800", marginLeft:10, marginRight:10, flex:1 }}>
        {title}
      </Text>
    </Pressable>
  );
}
