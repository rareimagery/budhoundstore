import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ShopScreen from "../screens/ShopScreen";
import ProductScreen from "../screens/ProductScreen";
import { colors } from "../lib/theme";

const Stack = createNativeStackNavigator();

export default function ShopStack() {
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
        name="ShopList"
        component={ShopScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={({ route }) => ({
          title: route.params?.title || "Product",
          headerBackTitle: "Shop",
        })}
      />
    </Stack.Navigator>
  );
}
