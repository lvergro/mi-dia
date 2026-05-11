import { Tabs } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { useAuth } from "../../hooks/useAuth";

function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <TouchableOpacity onPress={() => signOut()} style={{ marginRight: 16 }}>
      <Text style={{ color: "#4f46e5", fontSize: 14 }}>Salir</Text>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: { paddingBottom: 4 },
        headerStyle: { backgroundColor: "#f8fafc" },
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Mi Día",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>☀️</Text>,
          headerRight: () => <SignOutButton />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historial",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notas",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📝</Text>,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: "Medicamentos",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💊</Text>,
        }}
      />
    </Tabs>
  );
}
