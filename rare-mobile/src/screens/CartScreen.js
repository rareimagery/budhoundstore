import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../hooks/useCart";
import CartItemRow from "../components/CartItemRow";
import NeonButton from "../components/NeonButton";
import { colors } from "../lib/theme";

export default function CartScreen() {
  const navigation = useNavigation();
  const {
    items,
    itemCount,
    totalPrice,
    updateItemQuantity,
    removeItem,
    clearCart,
  } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Cart <Text style={styles.titleCount}>({itemCount})</Text>
        </Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
          <NeonButton
            title="Start Shopping"
            onPress={() => navigation.navigate("Shop")}
            style={styles.shopButton}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.order_item_id)}
            renderItem={({ item }) => (
              <CartItemRow
                item={item}
                onUpdateQuantity={updateItemQuantity}
                onRemove={removeItem}
              />
            )}
            contentContainerStyle={styles.list}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{totalPrice}</Text>
            </View>

            <NeonButton
              title="Checkout"
              onPress={() => navigation.navigate("Checkout")}
            />

            <NeonButton
              title="Clear Cart"
              variant="danger"
              onPress={clearCart}
              style={styles.clearButton}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.zinc950,
  },
  header: {
    padding: 16,
    paddingTop: 56,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  titleCount: {
    color: colors.neonGreen,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  emptyText: {
    color: colors.zinc500,
    fontSize: 16,
    marginBottom: 20,
  },
  shopButton: {
    paddingHorizontal: 32,
  },
  list: {
    paddingHorizontal: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.white10,
    padding: 16,
    gap: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    color: colors.neonGreen,
    fontSize: 18,
    fontWeight: "bold",
  },
  clearButton: {
    marginTop: 2,
  },
});
