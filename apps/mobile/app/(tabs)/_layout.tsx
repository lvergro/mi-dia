import { Tabs } from "expo-router";
import { ClipboardList, NotebookPen, Pill, Sun, User } from "lucide-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme";
import { useAuth } from "../../hooks/useAuth";

function TabIcon({
  Icon,
  color,
  focused,
}: {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  color: string;
  focused: boolean;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: focused ? colors.primarySubtle : "transparent",
      }}
    >
      <Icon size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />
    </View>
  );
}

function HeaderLeft() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 16, gap: 8 }}>
      <Image
        source={require("../../assets/icon.png")}
        style={{ width: 26, height: 26, borderRadius: 6 }}
        resizeMode="contain"
      />
      <Text style={{ fontSize: 17, fontWeight: "700", color: colors.primary, letterSpacing: -0.3 }}>
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
        borderColor: colors.cardBorder,
        backgroundColor: colors.white,
      }}
    >
      <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: "500" }}>Salir</Text>
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
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray100,
          borderTopWidth: 1,
          paddingBottom: insets.bottom || 6,
          paddingTop: 4,
          height: tabBarHeight,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        headerStyle: { backgroundColor: colors.white, elevation: 0, shadowOpacity: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          ...sharedHeader,
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Sun} color={color} focused={focused} />,
          tabBarLabel: "Mi Día",
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          ...sharedHeader,
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Pill} color={color} focused={focused} />,
          tabBarLabel: "Rutina",
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          ...sharedHeader,
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={NotebookPen} color={color} focused={focused} />,
          tabBarLabel: "Notas",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          ...sharedHeader,
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={ClipboardList} color={color} focused={focused} />,
          tabBarLabel: "Historial",
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          ...sharedHeader,
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={User} color={color} focused={focused} />,
          tabBarLabel: "Mi Cuenta",
        }}
      />
    </Tabs>
  );
}
