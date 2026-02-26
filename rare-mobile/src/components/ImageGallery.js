import { useState, useRef } from "react";
import { View, Image, FlatList, Pressable, Dimensions, StyleSheet } from "react-native";
import { colors } from "../lib/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const IMAGE_SIZE = SCREEN_WIDTH - 32;

export default function ImageGallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  if (!images || images.length === 0) {
    return (
      <View style={styles.placeholder}>
        <View style={styles.placeholderInner} />
      </View>
    );
  }

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View>
      {/* Main image carousel */}
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.url }} style={styles.mainImage} />
          </View>
        )}
      />

      {/* Dots indicator */}
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: i, animated: true });
                setActiveIndex(i);
              }}
            >
              <View
                style={[
                  styles.dot,
                  i === activeIndex && styles.dotActive,
                ]}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    aspectRatio: 1,
    backgroundColor: colors.zinc800,
    borderRadius: 24,
    margin: 16,
  },
  placeholderInner: {
    flex: 1,
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    aspectRatio: 1,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.zinc800,
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.zinc700,
  },
  dotActive: {
    backgroundColor: colors.neonGreen,
    width: 24,
  },
});
