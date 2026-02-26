import { View, Text, Pressable, StyleSheet } from "react-native";
import { COLOR_HEX_MAP, colorToMachine } from "../lib/constants";
import { colors } from "../lib/theme";

export default function ColorPicker({ colors: colorList, selectedColor, onSelect }) {
  return (
    <View>
      <Text style={styles.label}>
        Color{selectedColor ? `: ${selectedColor}` : ""}
      </Text>
      <View style={styles.row}>
        {colorList.map((color) => {
          const machine = colorToMachine(color);
          const hex = COLOR_HEX_MAP[machine];
          const active = color === selectedColor;

          return (
            <Pressable
              key={color}
              onPress={() => onSelect(color)}
              style={[
                styles.swatch,
                active && styles.swatchActive,
              ]}
              accessibilityLabel={color}
            >
              <View
                style={[
                  styles.swatchInner,
                  { backgroundColor: hex || "#ccc" },
                ]}
              />
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
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.zinc700,
    padding: 2,
  },
  swatchActive: {
    borderColor: colors.neonGreen,
    borderWidth: 3,
  },
  swatchInner: {
    flex: 1,
    borderRadius: 14,
  },
});
