import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../lib/theme";

export default function NeonButton({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary", // primary | outline | danger
  style,
}) {
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        isDanger && styles.danger,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? colors.black : colors.white}
        />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary && styles.primaryText,
            isOutline && styles.outlineText,
            isDanger && styles.dangerText,
            (disabled || loading) && styles.disabledText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.neonGreen,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.white10,
  },
  danger: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.white10,
  },
  disabled: {
    backgroundColor: colors.white5,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  primaryText: {
    color: colors.black,
  },
  outlineText: {
    color: colors.zinc300,
  },
  dangerText: {
    color: colors.zinc500,
  },
  disabledText: {
    color: colors.zinc500,
  },
});
