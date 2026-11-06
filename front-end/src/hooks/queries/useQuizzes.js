import { useQuery } from '@tanstack/react-query';
import {
  getCourseQuiz,
  getMyQuizAttempts,
  getCourseQuizAttempts,
} from '../../services/quiz.service';
import { QUERY_KEYS } from '../../constants/query-keys';

/**
 * Hook to fetch course quiz and student's attempt status
 */
export function useCourseQuiz(courseId) {
  return useQuery({
    queryKey: QUERY_KEYS.quizzes.byCourse(courseId),
    queryFn: async () => {
      const response = await getCourseQuiz(courseId);
      return response.data.data;
    },
    enabled: Boolean(courseId),
  });
}

/**
 * Hook to fetch all quiz attempts of the current student
 */
export function useMyQuizAttempts() {
  return useQuery({
    queryKey: QUERY_KEYS.quizzes.myAttempts,
    queryFn: async () => {
      const response = await getMyQuizAttempts();
      return response.data.data.attempts;
    },
  });
}

/**
 * Hook to fetch quiz attempts for a specific course
 */
export function useCourseQuizAttempts(courseId) {
  return useQuery({
    queryKey: QUERY_KEYS.quizzes.courseAttempts(courseId),
    queryFn: async () => {
      const response = await getCourseQuizAttempts(courseId);
      return response.data.data.attempts;
    },
    enabled: Boolean(courseId),
  });
}

