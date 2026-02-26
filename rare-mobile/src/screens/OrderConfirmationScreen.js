import { View, Text, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import NeonButton from "../components/NeonButton";
import { colors } from "../lib/theme";

export default function OrderConfirmationScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const order = route.params?.order;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.check}>✓</Text>
        <Text style={styles.title}>Order Placed!</Text>

        {order?.orderId && (
          <Text style={styles.orderId}>Order #{order.orderId}</Text>
        )}

        {order?.paymentMethod && (
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Payment</Text>
            <Text style={styles.detailValue}>{order.paymentMethod}</Text>
          </View>
        )}

        <Text style={styles.message}>
          Thank you for shopping with RARE. Your order is being processed.
        </Text>
      </View>

      <NeonButton
        title="Continue Shopping"
        onPress={() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "CartList" }],
          });
          navigation.getParent()?.navigate("Shop");
        }}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.zinc950,
    padding: 24,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.zinc900,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
  },
  check: {
    fontSize: 48,
    color: colors.neonGreen,
    marginBottom: 16,
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  orderId: {
    color: colors.zinc400,
    fontSize: 14,
    fontFamily: "monospace",
    marginBottom: 20,
  },
  detail: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  detailLabel: {
    color: colors.zinc500,
    fontSize: 14,
  },
  detailValue: {
    color: colors.zinc300,
    fontSize: 14,
    fontWeight: "500",
  },
  message: {
    color: colors.zinc400,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: 24,
  },
});
