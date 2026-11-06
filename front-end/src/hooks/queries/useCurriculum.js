import { useQuery } from '@tanstack/react-query';
import { getCourseCurriculum, getLesson } from '../../services/curriculum.service';
import { QUERY_KEYS } from '../../constants/query-keys';

/**
 * Hook to fetch course curriculum (sections and lessons)
 */
export function useCurriculum(courseId) {
  return useQuery({
    queryKey: QUERY_KEYS.curriculum.byCourse(courseId),
    queryFn: async () => {
      const response = await getCourseCurriculum(courseId);
      return response.data.data;
    },
    enabled: Boolean(courseId),
  });
}

/**
 * Hook to fetch a single lesson by ID
 */
export function useLesson(courseId, lessonId) {
  return useQuery({
    queryKey: QUERY_KEYS.curriculum.lesson(courseId, lessonId),
    queryFn: async () => {
      const response = await getLesson(courseId, lessonId);
      return response.data.data;
    },
    enabled: Boolean(courseId && lessonId),
  });
}

