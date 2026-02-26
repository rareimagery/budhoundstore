import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import ShopStack from "./ShopStack";
import CartStack from "./CartStack";
import { useCart } from "../hooks/useCart";
import { colors } from "../lib/theme";

const Tab = createBottomTabNavigator();

// Simple icon components using unicode/text
function HomeIcon({ color, size }) {
  return <Text style={{ fontSize: size, color }}>&#x1f3e0;</Text>;
}

function ShopIcon({ color, size }) {
  return <Text style={{ fontSize: size, color }}>&#x1f6cd;</Text>;
}

function CartIcon({ color, size }) {
  const { itemCount } = useCart();
  return (
    <View>
      <Text style={{ fontSize: size, color }}>&#x1f6d2;</Text>
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount > 9 ? "9+" : itemCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.zinc950,
          borderTopColor: colors.white10,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.neonGreen,
        tabBarInactiveTintColor: colors.zinc500,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 1,
          textTransform: "uppercase",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopStack}
        options={{
          tabBarIcon: ShopIcon,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarIcon: CartIcon,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    backgroundColor: colors.neonGreen,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.black,
    fontSize: 10,
    fontWeight: "bold",
  },
});
