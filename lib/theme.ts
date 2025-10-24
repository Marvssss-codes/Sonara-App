// lib/theme.ts
export const theme = {
  colors: {
    bg:        "#0E0F13", // main background
    surface:   "#151825", // card bg (glass effect base)
    surface2:  "#0f121d", // deeper layer
    text:      "#FFFFFF",
    textSoft:  "#B6B9C5",
    border:    "#23263A",
    primary:   "#7C4DFF", // purple action like your CTA
    primary2:  "#A769FF", // gradient end
    accent:    "#5CD38C", // small accent (progress dots)
    danger:    "#FF5577",
  },
  radius: { sm: 10, md: 16, lg: 24, xl: 32 },
  spacing: { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 },
  fonts: { regular: "System", semibold: "System", bold: "System" },
  shadow: {
    card: { shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  },
};
