import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrderConfirmationScreen from "../screens/OrderConfirmationScreen";
import { colors } from "../lib/theme";

const Stack = createNativeStackNavigator();

export default function CartStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.zinc950 },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: colors.zinc950 },
      }}
    >
      <Stack.Screen
        name="CartList"
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: "Checkout" }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ title: "Order Confirmed", headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
