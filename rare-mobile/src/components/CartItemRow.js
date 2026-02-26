import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../lib/theme";

export default function CartItemRow({ item, onUpdateQuantity, onRemove }) {
  const qty = Math.round(Number(item.quantity || 1));
  const price = item.total_price?.formatted || "";
  const unitPrice = item.unit_price?.formatted || "";
  const title = item.title || "Item";

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        {unitPrice ? (
          <Text style={styles.unitPrice}>{unitPrice} each</Text>
        ) : null}
      </View>

      <View style={styles.quantityRow}>
        <Pressable
          onPress={() => onUpdateQuantity(item.order_item_id, qty - 1)}
          style={styles.qtyBtn}
        >
          <Text style={styles.qtyBtnText}>-</Text>
        </Pressable>
        <Text style={styles.qtyText}>{qty}</Text>
        <Pressable
          onPress={() => onUpdateQuantity(item.order_item_id, qty + 1)}
          style={styles.qtyBtn}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </Pressable>
      </View>

      <Text style={styles.price}>{price}</Text>

      <Pressable onPress={() => onRemove(item.order_item_id)}>
        <Text style={styles.remove}>Remove</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
    gap: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  unitPrice: {
    color: colors.zinc500,
    fontSize: 12,
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: colors.white10,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    color: colors.zinc300,
    fontSize: 14,
  },
  qtyText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "monospace",
    minWidth: 28,
    textAlign: "center",
  },
  price: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
    minWidth: 60,
    textAlign: "right",
  },
  remove: {
    color: colors.zinc500,
    fontSize: 11,
  },
});
