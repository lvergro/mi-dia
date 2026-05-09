import { Platform } from "react-native";

function isNotificationsAvailable(): boolean {
  try {
    require("expo-notifications");
    return true;
  } catch {
    return false;
  }
}

export function setupNotificationHandler(): void {
  if (!isNotificationsAvailable()) return;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Notifications = require("expo-notifications");
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!isNotificationsAvailable()) {
    console.warn("expo-notifications not available in this environment");
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Notifications = require("expo-notifications");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Device = require("expo-device");

  if (!Device.isDevice) {
    console.warn("Push notifications only work on physical devices");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}
