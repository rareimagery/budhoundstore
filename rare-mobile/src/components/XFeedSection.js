import { View, Text, Pressable, Linking, StyleSheet } from "react-native";
import { colors } from "../lib/theme";

const SAMPLE_POSTS = [
  { id: "1", text: "This golden retriever just made everyone's day at the park. Sometimes the simplest moments are the best ones.", date: "2h", likes: "24.3K", views: "1.8M" },
  { id: "2", text: "Be Rare.\n\nNew merch dropping soon. The shittest dog breed is going places.", date: "5h", likes: "18.7K", views: "1.2M" },
  { id: "3", text: "POV: Your dog realizes you said 'walk' and not 'bath'", date: "12h", likes: "42.1K", views: "2.1M" },
];

function PostCard({ post }) {
  return (
    <Pressable
      onPress={() => Linking.openURL("https://x.com/RareImagery")}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardName}>Rare Imagery</Text>
          <Text style={styles.cardHandle}>@RareImagery · {post.date}</Text>
        </View>
        <Text style={styles.xLogo}>𝕏</Text>
      </View>
      <Text style={styles.cardText}>{post.text}</Text>
      <View style={styles.cardStats}>
        <Text style={styles.stat}>♥ {post.likes}</Text>
        <Text style={styles.stat}>👁 {post.views}</Text>
      </View>
    </Pressable>
  );
}

export default function XFeedSection() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Latest from the pack</Text>
        <Pressable onPress={() => Linking.openURL("https://x.com/RareImagery")}>
          <Text style={styles.follow}>FOLLOW 𝕏</Text>
        </Pressable>
      </View>
      {SAMPLE_POSTS.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  follow: {
    color: colors.neonGreen,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: colors.white5,
    borderWidth: 1,
    borderColor: colors.white10,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardName: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  cardHandle: {
    color: colors.zinc500,
    fontSize: 12,
    marginTop: 1,
  },
  xLogo: {
    color: colors.zinc600,
    fontSize: 16,
  },
  cardText: {
    color: colors.zinc300,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardStats: {
    flexDirection: "row",
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: colors.white5,
    paddingTop: 10,
  },
  stat: {
    color: colors.zinc500,
    fontSize: 12,
  },
});
