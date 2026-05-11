import { Tabs } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";

function HeaderLeft() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 16, gap: 8 }}>
      <Image
        source={require("../../assets/icon.png")}
        style={{ width: 30, height: 30, borderRadius: 8 }}
        resizeMode="contain"
      />
      <Text style={{ fontSize: 17, fontWeight: "700", color: "#4f46e5", letterSpacing: -0.3 }}>
        Trazadía
      </Text>
    </View>
  );
}

function HeaderRight() {
  const { signOut } = useAuth();
  return (
    <TouchableOpacity
      onPress={() => void signOut()}
      style={{
        marginRight: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        backgroundColor: "#ffffff",
      }}
    >
      <Text style={{ fontSize: 13, color: "#6b7280", fontWeight: "500" }}>Salir</Text>
    </TouchableOpacity>
  );
}

const sharedHeader = {
  headerLeft: () => <HeaderLeft />,
  headerRight: () => <HeaderRight />,
  headerTitle: () => null,
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#f1f5f9",
          borderTopWidth: 1,
          paddingBottom: insets.bottom || 6,
          paddingTop: 4,
          height: tabBarHeight,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        headerStyle: { backgroundColor: "#ffffff", elevation: 0, shadowOpacity: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          ...sharedHeader,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>☀️</Text>,
          tabBarLabel: "Mi Día",
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          ...sharedHeader,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💊</Text>,
          tabBarLabel: "Medicamentos",
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          ...sharedHeader,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📝</Text>,
          tabBarLabel: "Notas",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          ...sharedHeader,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
          tabBarLabel: "Historial",
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          ...sharedHeader,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
          tabBarLabel: "Mi Cuenta",
        }}
      />
    </Tabs>
  );
}
