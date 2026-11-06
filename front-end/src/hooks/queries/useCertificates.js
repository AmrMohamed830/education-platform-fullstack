import { useQuery } from '@tanstack/react-query';
import {
  getCourseCertificate,
  getMyCertificates,
  verifyCertificate,
} from '../../services/certificate.service';
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

/**
 * Hook to verify a certificate by its unique code
 */
export function useVerifyCertificate(code, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.certificates.verify(code),
    queryFn: async () => {
      const response = await verifyCertificate(code);
      return response.data.data.certificate;
    },
    enabled: Boolean(code && enabled),
  });
}

