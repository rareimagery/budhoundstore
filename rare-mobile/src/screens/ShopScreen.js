import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { fetchProducts } from "../api/products";
import { STYLE_CATEGORIES } from "../lib/constants";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { colors } from "../lib/theme";

const SORT_OPTIONS = [
  { value: "name-asc", label: "A-Z" },
  { value: "name-desc", label: "Z-A" },
  { value: "price-asc", label: "$ Low" },
  { value: "price-desc", label: "$ High" },
];

const ALL_TABS = [
  { key: null, label: "All" },
  ...Object.entries(STYLE_CATEGORIES).map(([key, config]) => ({
    key,
    label: config.label,
  })),
];

export default function ShopScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const initialCategory = route.params?.category || null;
  const [category, setCategory] = useState(initialCategory);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("name-asc");

  useEffect(() => {
    if (route.params?.category) {
      setCategory(route.params.category);
    }
  }, [route.params?.category]);

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then(setAllProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let products = allProducts;

    if (category && STYLE_CATEGORIES[category]) {
      const styles = STYLE_CATEGORIES[category].styles;
      products = products.filter((p) => styles.includes(p.styleMachine));
    }

    const sorted = [...products];
    switch (sort) {
      case "name-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.priceRange.min - b.priceRange.min);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.priceRange.max - a.priceRange.max);
        break;
    }

    return sorted;
  }, [allProducts, category, sort]);

  const heading = category
    ? STYLE_CATEGORIES[category]?.label || "Products"
    : "All Products";

  const navigateToProduct = (product) => {
    navigation.navigate("Product", {
      productId: product.id,
      title: product.title,
      product,
    });
  };

  return (
    <View style={styles.container}>
      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {ALL_TABS.map((tab) => {
          const active = tab.key === category;
          return (
            <Pressable
              key={tab.key ?? "all"}
              onPress={() => setCategory(tab.key)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Header + sort */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>{heading}</Text>
          {!loading && (
            <Text style={styles.count}>
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortRow}
        >
          {SORT_OPTIONS.map((opt) => {
            const active = opt.value === sort;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setSort(opt.value)}
                style={[styles.sortPill, active && styles.sortPillActive]}
              >
                <Text style={[styles.sortText, active && styles.sortTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Products */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No products in this category yet.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={navigateToProduct} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.zinc950,
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
    maxHeight: 50,
  },
  tabBarContent: {
    paddingHorizontal: 16,
    gap: 20,
    alignItems: "center",
  },
  tab: {
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: colors.neonGreen,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.zinc500,
  },
  tabTextActive: {
    color: colors.neonGreen,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heading: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "bold",
  },
  count: {
    color: colors.zinc500,
    fontSize: 13,
    marginTop: 2,
  },
  sortRow: {
    gap: 6,
    alignItems: "center",
  },
  sortPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.white10,
  },
  sortPillActive: {
    borderColor: colors.neonGreen,
    backgroundColor: colors.neonGlow,
  },
  sortText: {
    color: colors.zinc400,
    fontSize: 11,
    fontWeight: "500",
  },
  sortTextActive: {
    color: colors.neonGreen,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  gridRow: {
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
