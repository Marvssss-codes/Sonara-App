// components/SafeImage.tsx
import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { Image as ExpoImage } from "expo-image";

type Props = {
  /** remote/local string URI (https://, http://, file://, ph://, content://, assets-library://, data:) */
  uri?: string | null;
  /** OR pass a static require like: require("../assets/foo.png") */
  src?: number | null;
  style?: StyleProp<ViewStyle> | any;
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  placeholderBg?: string;
};

/** Normalize string URIs; allow known schemes only */
function normalize(uri?: string | null): string | null {
  if (!uri || typeof uri !== "string") return null;

  // protocol-relative → https
  if (uri.startsWith("//")) return `https:${uri}`;
  // upgrade http → https
  if (uri.startsWith("http://")) return uri.replace("http://", "https://");

  // accepted schemes
  const ok = ["https://", "file://", "ph://", "content://", "assets-library://", "data:"];
  if (ok.some((p) => uri.startsWith(p))) return uri;

  return null;
}

/** Safe image renderer that never crashes if the source is missing/invalid */
export default function SafeImage({
  uri,
  src,
  style,
  contentFit = "cover",
  placeholderBg = "rgba(255,255,255,0.08)",
}: Props) {
  if (typeof src === "number") {
    // static require() path
    return <ExpoImage source={src} style={style} contentFit={contentFit} transition={150} cachePolicy="memory-disk" />;
  }

  const safe = normalize(uri);
  if (!safe) return <View style={[{ backgroundColor: placeholderBg }, style]} />;

  return (
    <ExpoImage
      source={{ uri: safe }}
      style={style}
      contentFit={contentFit}
      transition={150}
      cachePolicy="memory-disk"
    />
  );
}
