import { ActivityIndicator, View } from "react-native";
import LottieView from "lottie-react-native";
import { theme } from "../lib/theme";

export default function Loader() {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 24 }}>
      {/* If you add assets/lottie/loader.json it will animate, else indicator shows */}
      {/* @ts-ignore */}
      <LottieView
        source={require("../assets/lottie/loader.json")}
        autoPlay
        loop
        style={{ width: 120, height: 120 }}
        onError={() => {}}
      />
      <ActivityIndicator size="small" color={theme.colors.primary} />
    </View>
  );
}
