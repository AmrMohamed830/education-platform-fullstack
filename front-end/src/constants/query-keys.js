/**
 * Centralized Query Keys Registry for TanStack Query
 * Enables precise cache invalidation and prevents duplicate keys.
 */
export const QUERY_KEYS = {
  auth: {
    all: ['auth'],
    me: ['auth', 'me'],
    adminStats: ['auth', 'admin-stats'],
  },
  courses: {
    all: ['courses'],
    list: (params = {}) => ['courses', 'list', params],
    detail: (id) => ['courses', 'detail', id],
  },
  curriculum: {
    all: ['curriculum'],
    byCourse: (courseId) => ['curriculum', 'course', courseId],
    lesson: (courseId, lessonId) => ['curriculum', 'lesson', courseId, lessonId],
  },
  enrollments: {
    all: ['enrollments'],
    my: ['enrollments', 'my'],
    progress: (courseId) => ['enrollments', 'progress', courseId],
  },
  reviews: {
    all: ['reviews'],
    byCourse: (courseId) => ['reviews', 'course', courseId],
  },
  certificates: {
    all: ['certificates'],
    byCourse: (courseId) => ['certificates', 'course', courseId],
    my: ['certificates', 'my'],
    verify: (code) => ['certificates', 'verify', code],
  },
  quizzes: {
    all: ['quizzes'],
    byCourse: (courseId) => ['quizzes', 'course', courseId],
    myAttempts: ['quizzes', 'my-attempts'],
    courseAttempts: (courseId) => ['quizzes', 'course-attempts', courseId],
  },
  notifications: {
    all: ['notifications'],
  },
};

