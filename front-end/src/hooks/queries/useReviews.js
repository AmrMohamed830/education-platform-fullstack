import { useQuery } from '@tanstack/react-query';
import { getCourseReviews } from '../../services/review.service';
import { QUERY_KEYS } from '../../constants/query-keys';

/**
 * Hook to fetch course reviews and rating breakdown
 */
export function useCourseReviews(courseId) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.byCourse(courseId),
    queryFn: async () => {
      const response = await getCourseReviews(courseId);
      return response.data.data;
    },
    enabled: Boolean(courseId),
  });
}

