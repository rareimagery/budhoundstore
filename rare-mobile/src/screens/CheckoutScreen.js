import { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../hooks/useCart";
import { useCheckout } from "../hooks/useCheckout";
import NeonButton from "../components/NeonButton";
import { colors } from "../lib/theme";

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { items, totalPrice } = useCart();
  const {
    checkout,
    processing,
    error,
    completedOrder,
    updateCustomerInfo,
    updateAddress,
    updateOrderNotes,
    goToStep,
    saveCustomerInfo,
    placeOrder,
  } = useCheckout();

  useEffect(() => {
    if (checkout.step === "complete" && completedOrder) {
      navigation.replace("OrderConfirmation", { order: completedOrder });
    }
  }, [checkout.step, completedOrder, navigation]);

  if (items.length === 0 && checkout.step !== "complete") {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Pressable onPress={() => navigation.navigate("Shop")}>
          <Text style={styles.emptyLink}>Continue shopping</Text>
        </Pressable>
      </View>
    );
  }

  const { customerInfo } = checkout;
  const { address } = customerInfo;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Steps */}
      <View style={styles.steps}>
        <Text style={[styles.step, checkout.step === "information" && styles.stepActive]}>
          Information
        </Text>
        <Text style={styles.stepSep}>›</Text>
        <Text style={[styles.step, checkout.step === "review" && styles.stepActive]}>
          Review
        </Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Step 1: Information */}
      {checkout.step === "information" && (
        <View>
          <Text style={styles.heading}>Contact & Shipping</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={customerInfo.email}
            onChangeText={(v) => updateCustomerInfo("email", v)}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor={colors.zinc600}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                value={customerInfo.firstName}
                onChangeText={(v) => updateCustomerInfo("firstName", v)}
                style={styles.input}
                placeholderTextColor={colors.zinc600}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                value={customerInfo.lastName}
                onChangeText={(v) => updateCustomerInfo("lastName", v)}
                style={styles.input}
                placeholderTextColor={colors.zinc600}
              />
            </View>
          </View>

          <Text style={styles.label}>Phone (optional)</Text>
          <TextInput
            value={customerInfo.phone}
            onChangeText={(v) => updateCustomerInfo("phone", v)}
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor={colors.zinc600}
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            value={address.line1}
            onChangeText={(v) => updateAddress("line1", v)}
            placeholder="Street address"
            style={styles.input}
            placeholderTextColor={colors.zinc600}
          />
          <TextInput
            value={address.line2}
            onChangeText={(v) => updateAddress("line2", v)}
            placeholder="Apt, suite, etc. (optional)"
            style={[styles.input, { marginTop: 8 }]}
            placeholderTextColor={colors.zinc600}
          />

          <View style={styles.rowThirds}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>City</Text>
              <TextInput
                value={address.city}
                onChangeText={(v) => updateAddress("city", v)}
                style={styles.input}
                placeholderTextColor={colors.zinc600}
              />
            </View>
            <View style={{ flex: 0.6 }}>
              <Text style={styles.label}>State</Text>
              <TextInput
                value={address.state}
                onChangeText={(v) => updateAddress("state", v)}
                style={styles.input}
                placeholderTextColor={colors.zinc600}
              />
            </View>
            <View style={{ flex: 0.6 }}>
              <Text style={styles.label}>ZIP</Text>
              <TextInput
                value={address.zip}
                onChangeText={(v) => updateAddress("zip", v)}
                keyboardType="number-pad"
                style={styles.input}
                placeholderTextColor={colors.zinc600}
              />
            </View>
          </View>

          <Text style={styles.label}>Order Notes (optional)</Text>
          <TextInput
            value={checkout.orderNotes}
            onChangeText={updateOrderNotes}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textarea]}
            placeholderTextColor={colors.zinc600}
          />

          <NeonButton
            title="Continue to Review"
            onPress={saveCustomerInfo}
            style={styles.submitBtn}
          />
        </View>
      )}

      {/* Step 2: Review */}
      {checkout.step === "review" && (
        <View>
          <Text style={styles.heading}>Review Order</Text>

          {/* Customer info summary */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryName}>
                  {customerInfo.firstName} {customerInfo.lastName}
                </Text>
                <Text style={styles.summaryDetail}>{customerInfo.email}</Text>
                <Text style={styles.summaryDetail}>
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                </Text>
                <Text style={styles.summaryDetail}>
                  {address.city}, {address.state} {address.zip}
                </Text>
              </View>
              <Pressable onPress={() => goToStep("information")}>
                <Text style={styles.editLink}>Edit</Text>
              </Pressable>
            </View>
          </View>

          {/* Items */}
          {items.map((item) => (
            <View key={item.order_item_id} style={styles.reviewItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewItemTitle}>{item.title}</Text>
                <Text style={styles.reviewItemQty}>
                  Qty: {Math.round(Number(item.quantity || 0))}
                </Text>
              </View>
              <Text style={styles.reviewItemPrice}>
                {item.total_price?.formatted}
              </Text>
            </View>
          ))}

          <View style={styles.reviewTotal}>
            <Text style={styles.reviewTotalLabel}>Total</Text>
            <Text style={styles.reviewTotalValue}>{totalPrice}</Text>
          </View>

          <View style={styles.paymentBox}>
            <Text style={styles.paymentTitle}>Payment: Cash on Delivery</Text>
            <Text style={styles.paymentDetail}>
              Please have the exact amount ready at delivery.
            </Text>
          </View>

          <View style={styles.reviewActions}>
            <NeonButton
              title="Back"
              variant="outline"
              onPress={() => goToStep("information")}
            />
            <NeonButton
              title={processing ? "Placing Order..." : "Place Order"}
              onPress={placeOrder}
              disabled={processing}
              loading={processing}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.zinc950,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.zinc950,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyLink: {
    color: colors.neonGreen,
    fontSize: 14,
  },
  steps: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  step: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: colors.zinc500,
  },
  stepActive: {
    color: colors.neonGreen,
  },
  stepSep: {
    color: colors.zinc500,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: colors.red900,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.red400,
    fontSize: 13,
  },
  heading: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    color: colors.zinc400,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.zinc900,
    color: colors.zinc200,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderRadius: 12,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  rowThirds: {
    flexDirection: "row",
    gap: 10,
  },
  submitBtn: {
    marginTop: 20,
  },

  // Review step
  summaryBox: {
    backgroundColor: colors.zinc900,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
  },
  summaryName: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  summaryDetail: {
    color: colors.zinc500,
    fontSize: 13,
    marginTop: 2,
  },
  editLink: {
    color: colors.neonGreen,
    fontSize: 12,
  },
  reviewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  reviewItemTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  reviewItemQty: {
    color: colors.zinc500,
    fontSize: 12,
    marginTop: 2,
  },
  reviewItemPrice: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  reviewTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.white10,
  },
  reviewTotalLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  reviewTotalValue: {
    color: colors.neonGreen,
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentBox: {
    backgroundColor: colors.zinc900,
    padding: 14,
    borderRadius: 16,
    marginTop: 14,
  },
  paymentTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  paymentDetail: {
    color: colors.zinc500,
    fontSize: 13,
  },
  reviewActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
});
