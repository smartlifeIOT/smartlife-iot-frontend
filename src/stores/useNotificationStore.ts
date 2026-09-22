import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto remove after duration
    const duration = notification.duration || 5000;
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, duration);
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));

// Helper functions for easier usage
export const toast = {
  success: (title: string, message = '') =>
    useNotificationStore
      .getState()
      .addNotification({ type: 'success', title, message }),
  error: (title: string, message = '') =>
    useNotificationStore
      .getState()
      .addNotification({ type: 'error', title, message }),
  warning: (title: string, message = '') =>
    useNotificationStore
      .getState()
      .addNotification({ type: 'warning', title, message }),
  info: (title: string, message = '') =>
    useNotificationStore
      .getState()
      .addNotification({ type: 'info', title, message }),
};
