import { View, Text, Pressable, StyleSheet } from "react-native";
import { SIZE_ORDER } from "../lib/constants";
import { colors } from "../lib/theme";

export default function SizePicker({ sizes, selectedSize, onSelect, disabledSizes = [] }) {
  const sorted = [...sizes].sort(
    (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)
  );

  return (
    <View>
      <Text style={styles.label}>
        Size{selectedSize ? `: ${selectedSize}` : ""}
      </Text>
      <View style={styles.row}>
        {sorted.map((size) => {
          const disabled = disabledSizes.includes(size);
          const active = size === selectedSize;
          return (
            <Pressable
              key={size}
              onPress={() => !disabled && onSelect(size)}
              disabled={disabled}
              style={[
                styles.pill,
                active && styles.pillActive,
                disabled && styles.pillDisabled,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  active && styles.pillTextActive,
                  disabled && styles.pillTextDisabled,
                ]}
              >
                {size}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: colors.zinc500,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    minWidth: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.zinc900,
    alignItems: "center",
  },
  pillActive: {
    backgroundColor: colors.neonGreen,
    borderColor: colors.neonGreen,
  },
  pillDisabled: {
    backgroundColor: colors.zinc900,
    borderColor: colors.zinc800,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.zinc300,
  },
  pillTextActive: {
    color: colors.black,
  },
  pillTextDisabled: {
    color: colors.zinc700,
    textDecorationLine: "line-through",
  },
});
