import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import axios from "axios";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications(userId: string | null, backendUrl: string) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    if (!userId) return;

    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        // Upload token to backend for this user
        saveTokenToBackend(token);
      }
    });

    // Listen for incoming notifications when app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listen for user interactions with notifications (taps)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response.notification.request.content.data);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [userId]);

  const saveTokenToBackend = async (token: string) => {
    try {
      const storageToken = localStorage.getItem("token"); // Or AsyncStorage in React Native
      await axios.put(
        `${backendUrl}/api/notifications/preferences`,
        { pushAlerts: true, fcmToken: token },
        {
          headers: {
            Authorization: `Bearer ${storageToken}`,
          },
        }
      );
      console.log("✅ Device Push Token successfully synchronized with backend");
    } catch (err: any) {
      console.warn("❌ Failed to synchronize push token with backend:", err.message);
    }
  };

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.warn("Permission not granted for push notifications!");
      return null;
    }
    
    // Get the Expo Push Token
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        console.warn("EAS Project ID not found in app.json. Please configure EAS.");
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (err: any) {
      console.warn("Error getting push token:", err.message);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}
