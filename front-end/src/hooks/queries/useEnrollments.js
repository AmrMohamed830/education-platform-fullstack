import { useQuery } from '@tanstack/react-query';
import { getMyEnrollments, getCourseProgress } from '../../services/enrollment.service';
import { QUERY_KEYS } from '../../constants/query-keys';

/**
 * Hook to fetch current user's enrolled courses with progress
 */
export function useMyEnrollments(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.enrollments.my,
    queryFn: async () => {
      const response = await getMyEnrollments();
      return response.data.data.enrollments || [];
    },
    enabled,
  });
}

/**
 * Hook to fetch current user's progress for a specific course
 */
export function useCourseProgress(courseId, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.enrollments.progress(courseId),
    queryFn: async () => {
      const response = await getCourseProgress(courseId);
      return response.data.data;
    },
    enabled: Boolean(courseId) && enabled,
  });
}

