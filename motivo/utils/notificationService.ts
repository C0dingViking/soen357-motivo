export type InAppNotification = {
  title: string;
  message: string;
  onDismiss?: () => void;
};

type NotificationListener = (notification: InAppNotification) => void;

const listeners = new Set<NotificationListener>();

export function showInAppNotification(notification: InAppNotification) {
  listeners.forEach((listener) => listener(notification));
}

export function subscribeToInAppNotifications(listener: NotificationListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
