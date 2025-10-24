import { View, Text, Image, Pressable } from "react-native";

type Props = {
  title: string;
  artist?: string;
  artwork?: string;
  onPress?: () => void;
  onFavorite?: () => void;
};

export default function SongCard({ title, artist, artwork, onPress, onFavorite }: Props) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection:"row", gap:12, padding:12, alignItems:"center" }}>
      <Image
        source={artwork ? { uri: artwork } : undefined}
        style={{ width:64, height:64, borderRadius:8, backgroundColor:"#eee" }}
      />
      <View style={{ flex:1 }}>
        <Text numberOfLines={1} style={{ fontWeight:"700" }}>{title}</Text>
        <Text numberOfLines={1} style={{ color:"#555" }}>{artist || "Unknown"}</Text>
      </View>
      <Pressable onPress={onFavorite} style={{ paddingVertical:8, paddingHorizontal:12, borderWidth:1, borderRadius:8 }}>
        <Text>♥</Text>
      </Pressable>
    </Pressable>
  );
}
