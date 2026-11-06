import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollInCourse, toggleLessonProgress } from '../../services/enrollment.service';
import { QUERY_KEYS } from '../../constants/query-keys';

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => enrollInCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.enrollments.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.curriculum.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.adminStats });
    },
  });
}

export function useToggleLesson(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId) => toggleLessonProgress(courseId, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.enrollments.progress(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.enrollments.my });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.certificates.byCourse(courseId) });
    },
  });
}

