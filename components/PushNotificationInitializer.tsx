import { usePushNotifications } from "@/services/usePushNotifications";


export const PushNotificationInitializer = () => {
  usePushNotifications();
  return null;
};
