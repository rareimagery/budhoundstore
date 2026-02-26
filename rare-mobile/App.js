import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CartProvider } from "./src/context/CartContext";
import { hydrateTokens } from "./src/api/tokenStore";
import RootNavigator from "./src/navigation/RootNavigator";
import LoadingSpinner from "./src/components/LoadingSpinner";
import { colors } from "./src/lib/theme";

const navTheme = {
  dark: true,
  colors: {
    primary: colors.neonGreen,
    background: colors.zinc950,
    card: colors.zinc950,
    text: colors.white,
    border: colors.white10,
    notification: colors.neonGreen,
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" },
    medium: { fontFamily: "System", fontWeight: "500" },
    bold: { fontFamily: "System", fontWeight: "700" },
    heavy: { fontFamily: "System", fontWeight: "900" },
  },
};

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateTokens()
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}
