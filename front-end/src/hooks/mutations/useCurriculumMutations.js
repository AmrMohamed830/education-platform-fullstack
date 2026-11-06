import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addSection,
  updateSection,
  deleteSection,
  addLesson,
  updateLesson,
  deleteLesson,
  reorderCurriculum,
} from '../../services/curriculum.service';
import { QUERY_KEYS } from '../../constants/query-keys';

export function useAddSection(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => addSection(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.curriculum.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
    },
  });
}

export function useUpdateSection(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, data }) => updateSection(courseId, sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.curriculum.byCourse(courseId) });
    },
  });
}

export function useDeleteSection(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sectionId) => deleteSection(courseId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.curriculum.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
    },
  });
}

export function useAddLesson(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, data }) => addLesson(courseId, sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.curriculum.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
    },
  });
}

export function useUpdateLesson(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, lessonId, data }) => updateLesson(courseId, sectionId, lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.curriculum.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
    },
  });
}

export function useDeleteLesson(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, lessonId }) => deleteLesson(courseId, sectionId, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.curriculum.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
    },
  });
}

export function useReorderCurriculum(courseId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sections) => reorderCurriculum(courseId, sections),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.curriculum.byCourse(courseId) });
    },
  });
}

