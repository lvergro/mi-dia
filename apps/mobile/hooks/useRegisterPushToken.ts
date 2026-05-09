import { useEffect } from "react";
import { upsertPushToken } from "@mi-dia/database";
import { registerForPushNotificationsAsync } from "../lib/notifications";

export function useRegisterPushToken(): void {
  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          return upsertPushToken(token);
        }
      })
      .catch((err) => {
        console.warn("Push token registration failed:", err);
      });
  }, []);
}
