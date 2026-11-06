import { useQuery } from '@tanstack/react-query';
import { getAllCourses, getCourse } from '../../services/course.service';
import { QUERY_KEYS } from '../../constants/query-keys';

/**
 * Hook to fetch all courses with optional filters (search, category, price, pagination)
 */
export function useCourses(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.list(params),
    queryFn: async () => {
      const response = await getAllCourses(params);
      return response.data.data;
    },
  });
}

/**
 * Hook to fetch single course details by ID
 */
export function useCourse(courseId) {
  return useQuery({
    queryKey: QUERY_KEYS.courses.detail(courseId),
    queryFn: async () => {
      const response = await getCourse(courseId);
      return response.data.data.course;
    },
    enabled: Boolean(courseId),
  });
}

