import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertCourseQuiz, submitQuiz } from '../../services/quiz.service';
import { QUERY_KEYS } from '../../constants/query-keys';

/**
 * Hook to create or update course quiz (Admin / Manager)
 */
export function useUpsertQuiz(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => upsertCourseQuiz(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.quizzes.byCourse(courseId),
      });
    },
  });
}

/**
 * Hook to submit student's quiz answers and evaluate
 */
export function useSubmitQuiz(courseId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers) => submitQuiz(courseId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.quizzes.byCourse(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.quizzes.myAttempts,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.certificates.byCourse(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.certificates.my,
      });
    },
  });
}

