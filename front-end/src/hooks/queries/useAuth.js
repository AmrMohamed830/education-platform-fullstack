import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, getAdminStatsAndStudents } from '../../services/auth.service';
import { QUERY_KEYS } from '../../constants/query-keys';

/**
 * Hook to fetch logged in user info
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data.data.user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 0,
  });
}

/**
 * Hook to fetch admin dashboard statistics and registered students
 */
export function useAdminStats(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.auth.adminStats,
    queryFn: async () => {
      const response = await getAdminStatsAndStudents();
      return response.data.data;
    },
    enabled,
  });
}

