import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { fetchProductByUuid } from "../api/products";
import { formatPrice, SIZE_ORDER } from "../lib/constants";
import { useAddToCart } from "../hooks/useAddToCart";
import ImageGallery from "../components/ImageGallery";
import SizePicker from "../components/SizePicker";
import ColorPicker from "../components/ColorPicker";
import NeonButton from "../components/NeonButton";
import LoadingSpinner from "../components/LoadingSpinner";
import { colors } from "../lib/theme";

export default function ProductScreen() {
  const route = useRoute();
  const { productId, product: passedProduct } = route.params || {};
  const [product, setProduct] = useState(passedProduct || null);
  const [loading, setLoading] = useState(!passedProduct);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, adding, success, error: cartError } = useAddToCart();

  useEffect(() => {
    if (!product && productId) {
      setLoading(true);
      fetchProductByUuid(productId)
        .then(setProduct)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [productId]);

  // Auto-select color when only one
  useEffect(() => {
    if (product?.availableColors?.length === 1) {
      setSelectedColor(product.availableColors[0]);
    }
  }, [product]);

  // Available sizes for selected color
  const availableSizesForColor = useMemo(() => {
    if (!product) return [];
    if (!selectedColor) return product.availableSizes;
    return [
      ...new Set(
        product.variations
          .filter((v) => v.color === selectedColor)
          .map((v) => v.size)
          .filter(Boolean)
      ),
    ].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
  }, [product, selectedColor]);

  // Auto-select size when only one
  useEffect(() => {
    if (availableSizesForColor.length === 1) {
      setSelectedSize(availableSizesForColor[0]);
    }
  }, [availableSizesForColor]);

  const disabledSizes = useMemo(() => {
    if (!product || !selectedColor) return [];
    return product.availableSizes.filter(
      (s) => !availableSizesForColor.includes(s)
    );
  }, [product, selectedColor, availableSizesForColor]);

  const selectedVariation = useMemo(() => {
    if (!product || !selectedColor || !selectedSize) return null;
    return product.variations.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  }, [product, selectedColor, selectedSize]);

  const handleAddToCart = () => {
    if (!selectedVariation) return;
    addToCart(selectedVariation.internalId, quantity);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Product not found</Text>
      </View>
    );
  }

  // Strip HTML tags from description
  const description = product.description
    ? product.description.replace(/<[^>]*>/g, "")
    : "";

  const priceDisplay = selectedVariation
    ? formatPrice(selectedVariation.price)
    : product.priceRange.min === product.priceRange.max
      ? formatPrice(product.priceRange.min)
      : `${formatPrice(product.priceRange.min)} - ${formatPrice(product.priceRange.max)}`;

  const buttonTitle = adding
    ? "Adding..."
    : success
      ? "Added!"
      : !selectedColor && product.availableColors.length > 1
        ? "Select a Color"
        : !selectedSize && product.availableSizes.length > 1
          ? "Select a Size"
          : !selectedVariation
            ? "Select Options"
            : "Add to Cart";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Images */}
      <ImageGallery images={product.images} />

      {/* Product info */}
      <View style={styles.info}>
        {product.styleName && (
          <Text style={styles.styleName}>{product.styleName}</Text>
        )}

        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>{priceDisplay}</Text>

        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}

        {/* Color picker */}
        {product.availableColors.length > 1 && (
          <View style={styles.pickerSection}>
            <ColorPicker
              colors={product.availableColors}
              selectedColor={selectedColor}
              onSelect={(color) => {
                setSelectedColor(color);
                if (
                  selectedSize &&
                  !product.variations.find(
                    (v) => v.color === color && v.size === selectedSize
                  )
                ) {
                  setSelectedSize(null);
                }
              }}
            />
          </View>
        )}

        {/* Size picker */}
        {product.availableSizes.length > 0 && (
          <View style={styles.pickerSection}>
            <SizePicker
              sizes={product.availableSizes}
              selectedSize={selectedSize}
              onSelect={setSelectedSize}
              disabledSizes={disabledSizes}
            />
          </View>
        )}

        {/* Quantity + Add to Cart */}
        <View style={styles.addRow}>
          <View style={styles.qtyControl}>
            <Pressable
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>-</Text>
            </Pressable>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <Pressable
              onPress={() => setQuantity(quantity + 1)}
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </Pressable>
          </View>

          <NeonButton
            title={buttonTitle}
            onPress={handleAddToCart}
            disabled={!selectedVariation || adding}
            loading={adding}
            style={styles.addButton}
          />
        </View>

        {cartError && (
          <Text style={styles.error}>{cartError}</Text>
        )}

        {selectedVariation?.sku && (
          <Text style={styles.sku}>SKU: {selectedVariation.sku}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.zinc950,
  },
  notFound: {
    flex: 1,
    backgroundColor: colors.zinc950,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  info: {
    padding: 20,
  },
  styleName: {
    color: colors.emerald400,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 6,
  },
  title: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "bold",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  price: {
    color: colors.zinc200,
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 16,
  },
  description: {
    color: colors.zinc400,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  pickerSection: {
    marginBottom: 20,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.white10,
    borderRadius: 16,
  },
  qtyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  qtyBtnText: {
    color: colors.zinc400,
    fontSize: 16,
  },
  qtyValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
    minWidth: 32,
    textAlign: "center",
  },
  addButton: {
    flex: 1,
  },
  error: {
    color: colors.red400,
    fontSize: 13,
    marginTop: 8,
  },
  sku: {
    color: colors.zinc600,
    fontSize: 11,
    marginTop: 16,
  },
});
