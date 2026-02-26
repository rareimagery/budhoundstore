import { Pressable, View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { formatPrice } from "../lib/constants";
import { colors } from "../lib/theme";

const CARD_GAP = 12;
const SCREEN_PAD = 16;
const CARD_WIDTH = (Dimensions.get("window").width - SCREEN_PAD * 2 - CARD_GAP) / 2;

export default function ProductCard({ product, onPress }) {
  const image = product.images?.[0];
  const { priceRange } = product;

  const priceLabel =
    priceRange.min === priceRange.max
      ? formatPrice(priceRange.min)
      : `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`;

  return (
    <Pressable
      onPress={() => onPress?.(product)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image.url }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{priceLabel}</Text>
        </View>
      </View>

      <View style={styles.info}>
        {product.styleName && (
          <Text style={styles.breed}>RARE BREED</Text>
        )}
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.zinc900,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: CARD_GAP,
  },
  pressed: {
    opacity: 0.9,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.zinc800,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: colors.zinc600,
    fontSize: 12,
  },
  priceBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.black70,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  priceText: {
    color: colors.zinc200,
    fontSize: 11,
    fontFamily: "monospace",
  },
  info: {
    padding: 14,
  },
  breed: {
    color: colors.emerald400,
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
});
