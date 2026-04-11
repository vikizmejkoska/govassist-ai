import { http } from '@/api/http';
import type { NotificationDto } from '@/api/types';

type NotificationApiResponse = NotificationDto & {
  read?: boolean;
};

function normalizeNotification(notification: NotificationApiResponse): NotificationDto {
  return {
    ...notification,
    isRead: notification.isRead ?? notification.read ?? false,
  };
}

export const notificationsApi = {
  list: async () => {
    const notifications = await http.get<NotificationApiResponse[]>('/api/notifications');
    return notifications.map(normalizeNotification);
  },
  unreadCount: () => http.get<number>('/api/notifications/unread-count'),
  markRead: async (notificationId: number) => {
    const notification = await http.put<NotificationApiResponse>(`/api/notifications/${notificationId}/read`);
    return normalizeNotification(notification);
  },
};
