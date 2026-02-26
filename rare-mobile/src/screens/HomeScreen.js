import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import XFeedSection from "../components/XFeedSection";
import LoadingSpinner from "../components/LoadingSpinner";
import { colors } from "../lib/theme";
import { API_BASE_URL } from "../api/config";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CATEGORIES = [
  { key: "hoodies", label: "Hoodies", description: "Pullover \u2022 Zip-up \u2022 Stay Lifted" },
  { key: "tees", label: "Tees", description: "Rare Breed \u2022 Crew \u2022 V-Neck" },
  { key: "hats", label: "Hats", description: "Trucker \u2022 Beanie \u2022 Snapback" },
  { key: "accessories", label: "Accessories", description: "Socks \u2022 Totes \u2022 Stickers" },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then((products) => {
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        setFeatured(shuffled.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const navigateToProduct = (product) => {
    navigation.navigate("Shop", {
      screen: "Product",
      params: { productId: product.id, title: product.title, product },
    });
  };

  const navigateToCategory = (category) => {
    navigation.navigate("Shop", {
      screen: "ShopList",
      params: { category },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroOverlay}>
          <View style={styles.heroContent}>
            <View style={styles.dropBadge}>
              <View style={styles.dropDot} />
              <Text style={styles.dropText}>LIMITED 2026 DROP</Text>
            </View>

            <Text style={styles.heroTitle}>
              BE{"\n"}RARE
            </Text>

            <Text style={styles.heroSubtitle}>
              I'm just Rare.{"\n"}Wear the pack. Stay lifted.
            </Text>

            <Pressable
              onPress={() => navigation.navigate("Shop")}
              style={styles.heroButton}
            >
              <Text style={styles.heroButtonText}>SHOP THE DROP  →</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>CATEGORIES</Text>
          <Text style={styles.sectionTitle}>Gear for the pack</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() => navigateToCategory(cat.key)}
              style={styles.catCard}
            >
              <View style={styles.catImagePlaceholder}>
                <Text style={styles.catEmoji}>
                  {cat.key === "hoodies" ? "🧥" : cat.key === "tees" ? "👕" : cat.key === "hats" ? "🧢" : "🎒"}
                </Text>
              </View>
              <View style={styles.catInfo}>
                <Text style={styles.catLabel}>{cat.label}</Text>
                <Text style={styles.catDesc}>{cat.description}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Featured */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.freshRow}>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
            <Text style={styles.sectionTitle}>Fresh from the den</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("Shop")}>
            <Text style={styles.viewAll}>ALL DROPS →</Text>
          </Pressable>
        </View>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <View style={styles.featuredGrid}>
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={navigateToProduct}
              />
            ))}
          </View>
        )}
      </View>

      {/* X Feed */}
      <XFeedSection />

      {/* Manifesto */}
      <View style={styles.manifesto}>
        <Text style={styles.manifestoLabel}>THE MANIFESTO</Text>
        <Text style={styles.manifestoTitle}>
          I'm just Rare.{"\n"}
          <Text style={styles.manifestoFaded}>So are you.</Text>
        </Text>
        <Text style={styles.manifestoBody}>
          No gatekeeping. No trends. Just dogs that hit different, stories that
          matter, and gear that feels like home.
        </Text>
        <Pressable
          onPress={() => navigation.navigate("Shop")}
          style={styles.manifestoButton}
        >
          <Text style={styles.manifestoButtonText}>JOIN THE RARE BREED</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.zinc950,
  },

  // Hero
  hero: {
    height: Dimensions.get("window").height * 0.55,
    backgroundColor: colors.black,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: colors.black85,
    justifyContent: "flex-end",
    padding: 24,
    paddingBottom: 48,
  },
  heroContent: {},
  dropBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    alignSelf: "flex-start",
    marginBottom: 16,
    gap: 8,
  },
  dropDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neonGreen,
  },
  dropText: {
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 3,
    color: colors.zinc200,
  },
  heroTitle: {
    fontSize: 72,
    fontWeight: "bold",
    color: colors.white,
    lineHeight: 72,
    letterSpacing: -3,
  },
  heroSubtitle: {
    fontSize: 20,
    color: colors.zinc400,
    marginTop: 16,
    lineHeight: 28,
  },
  heroButton: {
    backgroundColor: colors.neonGreen,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginTop: 24,
  },
  heroButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "700",
  },

  // Sections
  section: {
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    color: colors.neonGreen,
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  freshRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  newBadge: {
    backgroundColor: colors.neonGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    color: colors.black,
    fontSize: 10,
    fontWeight: "800",
  },
  viewAll: {
    color: colors.zinc300,
    fontSize: 13,
    marginTop: 8,
  },

  // Categories
  catRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  catCard: {
    width: 160,
    backgroundColor: colors.zinc900,
    borderRadius: 24,
    overflow: "hidden",
  },
  catImagePlaceholder: {
    height: 100,
    backgroundColor: colors.zinc800,
    alignItems: "center",
    justifyContent: "center",
  },
  catEmoji: {
    fontSize: 36,
  },
  catInfo: {
    padding: 14,
  },
  catLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  catDesc: {
    color: colors.zinc500,
    fontSize: 11,
    marginTop: 2,
  },

  // Featured grid
  featuredGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  // Manifesto
  manifesto: {
    paddingVertical: 64,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  manifestoLabel: {
    color: colors.emerald400,
    fontSize: 11,
    letterSpacing: 6,
    textTransform: "uppercase",
    fontFamily: "monospace",
    marginBottom: 16,
  },
  manifestoTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    lineHeight: 40,
    letterSpacing: -1,
  },
  manifestoFaded: {
    color: colors.zinc500,
  },
  manifestoBody: {
    color: colors.zinc400,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 20,
    maxWidth: 320,
  },
  manifestoButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 24,
    marginTop: 32,
  },
  manifestoButtonText: {
    color: colors.black,
    fontSize: 15,
    fontWeight: "600",
  },
});
