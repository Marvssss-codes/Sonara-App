// lib/theme.ts
export const theme = {
  colors: {
    bg: "#0B0E17",
    bg2: "#0F1330",
    glass: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
    text: "#FFFFFF",
    textSoft: "#B7BCD3",
    primary: "#8E59FF",
    primary2: "#C07CFF",
    danger: "#FF5577",
    card: "#131A2C",
  },
  radius: { sm: 12, md: 16, lg: 22, xl: 32, pill: 999 },
  spacing: { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 },
  shadow: {
    glow: {
      shadowColor: "#8E59FF",
      shadowOpacity: 0.35,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    card: {
      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  },
};
