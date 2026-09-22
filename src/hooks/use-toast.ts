import { useNotificationStore, toast as toastHelper } from '@/stores/useNotificationStore';

export const useToast = () => {
  const { addNotification, removeNotification, notifications } = useNotificationStore();

  return {
    toast: toastHelper,
    notifications,
    addNotification,
    removeNotification,
  };
};