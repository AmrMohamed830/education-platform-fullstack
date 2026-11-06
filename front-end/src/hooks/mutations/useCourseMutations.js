import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCourse, updateCourse, deleteCourse } from '../../services/course.service';
import { QUERY_KEYS } from '../../constants/query-keys';

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => addCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.adminStats });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }) => updateCourse(courseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.adminStats });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.adminStats });
    },
  });
}

