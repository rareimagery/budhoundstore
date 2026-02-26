import { View, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../lib/theme";

export default function LoadingSpinner({ fullScreen, size = "large" }) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={colors.neonGreen} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.neonGreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: colors.zinc950,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingVertical: 48,
    alignItems: "center",
  },
});
