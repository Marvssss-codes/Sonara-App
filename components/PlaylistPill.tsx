// components/PlaylistPill.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import SafeImage from "./SafeImage";

const CARD = "rgba(255,255,255,0.06)";
const STROKE = "rgba(255,255,255,0.10)";

export default function PlaylistPill({
  title,
  image,
  onPress,
}: {
  title: string;
  image: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: "48%",
        height: 64,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: STROKE,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <SafeImage
        uri={image ?? null}
        style={{ width: 64, height: "100%" }}
        contentFit="cover"
      />
      <View style={{ flex: 1, paddingHorizontal: 10 }}>
        <Text style={{ color: "#fff", fontWeight: "900" }} numberOfLines={1}>
          {title}
        </Text>
        <Text style={{ color: "#B7BCD3", fontSize: 12 }} numberOfLines={1}>
          Open playlist
        </Text>
      </View>
    </Pressable>
  );
}
