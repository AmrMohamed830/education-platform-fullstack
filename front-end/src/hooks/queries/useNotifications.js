import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/notification.service';
import { QUERY_KEYS } from '../../constants/query-keys';
import useAuthStore from '../../store/auth.store';

export function useNotifications() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: QUERY_KEYS.notifications.all,
    queryFn: async () => {
      const res = await getMyNotifications();
      return res.data.data;
    },
    enabled: Boolean(user),
    refetchInterval: 20000, // Poll every 20 seconds
    staleTime: 10000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
}

