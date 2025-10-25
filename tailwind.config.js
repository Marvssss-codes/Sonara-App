/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0E17",
        bg2: "#0F1330",
        glass: "rgba(255,255,255,0.06)",
        border: "rgba(255,255,255,0.12)",
        text: "#FFFFFF",
        textSoft: "#B7BCD3",
        primary: "#8E59FF",
        primary2: "#C07CFF",
      },
      borderRadius: {
        xl: 24,
        pill: 999,
      },
      fontWeight: {
        extrabold: "800",
      },
      letterSpacing: {
        wide2: "0.12em",
      },
    },
  },
  plugins: [],
};
