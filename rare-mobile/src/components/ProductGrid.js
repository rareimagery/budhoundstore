import { FlatList, View, Text, StyleSheet } from "react-native";
import ProductCard from "./ProductCard";
import { colors } from "../lib/theme";

export default function ProductGrid({ products, emptyMessage, onProductPress }) {
  if (!products || products.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {emptyMessage || "No products found."}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={onProductPress} />
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: "space-between",
  },
  empty: {
    paddingVertical: 64,
    alignItems: "center",
  },
  emptyText: {
    color: colors.zinc500,
    fontSize: 16,
  },
});
