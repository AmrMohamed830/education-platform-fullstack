import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitReview, deleteReview } from '../../services/review.service';
import { QUERY_KEYS } from '../../constants/query-keys';

export function useSubmitReview(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rating, comment }) => submitReview(courseId, { rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.adminStats });
    },
  });
}

export function useDeleteReview(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.adminStats });
    },
  });
}

