import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  loginUser,
  registerUser,
  logout as logoutApi,
  updateProfile,
  changePassword,
} from '../../services/auth.service';
import { QUERY_KEYS } from '../../constants/query-keys';
import useAuthStore from '../../store/auth.store';

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data) => loginUser(data),
    onSuccess: (res) => {
      const user = res.data.data.user;
      setUser(user);
      queryClient.setQueryData(QUERY_KEYS.auth.me, user);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.enrollments.all });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data) => registerUser(data),
    onSuccess: (res) => {
      const user = res.data.data.user;
      setUser(user);
      queryClient.setQueryData(QUERY_KEYS.auth.me, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      logoutStore();
      // Completely clear React Query cache so no user-specific data leaks
      queryClient.clear();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data) => updateProfile(data),
    onSuccess: (res) => {
      const updatedUser = res.data.data.user;
      setUser(updatedUser);
      queryClient.setQueryData(QUERY_KEYS.auth.me, updatedUser);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data) => changePassword(data),
  });
}

