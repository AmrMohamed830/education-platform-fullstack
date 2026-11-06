import api from '../lib/axios';

// Get my notifications & unread count
export const getMyNotifications = () => {
  return api.get('/api/notifications');
};

// Mark single notification as read
export const markNotificationAsRead = (id) => {
  return api.patch(`/api/notifications/${id}/read`);
};

// Mark all as read
export const markAllNotificationsAsRead = () => {
  return api.patch('/api/notifications/read-all');
};

