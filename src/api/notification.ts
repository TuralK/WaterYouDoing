import apiClient from './apiClient';
import { Notification } from '../types/models';

interface NotificationQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
}

export const notificationApi = {
  getNotifications: async (params?: NotificationQueryParams): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/notifications', { params });
    return response.data;
  },

  getNotificationById: async (id: string): Promise<Notification> => {
    const response = await apiClient.get<Notification>(`/notifications/${id}`);
    return response.data;
  },

  markAllNotificationsAsRead: async (params?: NotificationQueryParams): Promise<void> => {
    await apiClient.put('/notifications/mark-all-read', { params });
  },

};