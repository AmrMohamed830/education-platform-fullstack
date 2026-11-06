import { useQuery } from '@tanstack/react-query';
import { getCourseCertificate, getMyCertificates } from '../../services/certificate.service';
import { QUERY_KEYS } from '../../constants/query-keys';

/**
 * Hook to fetch course certificate for current student
 */
export function useCourseCertificate(courseId) {
  return useQuery({
    queryKey: QUERY_KEYS.certificates.byCourse(courseId),
    queryFn: async () => {
      const response = await getCourseCertificate(courseId);
      return response.data.data.certificate;
    },
    enabled: Boolean(courseId),
  });
}

/**
 * Hook to fetch all certificates earned by logged-in user
 */
export function useMyCertificates(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.certificates.my,
    queryFn: async () => {
      const response = await getMyCertificates();
      return response.data.data.certificates || [];
    },
    enabled,
  });
}

