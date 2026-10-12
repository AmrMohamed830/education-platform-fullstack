"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/auth.store";
import { getCurrentUser } from "@/services/auth.service";

export default function AuthProvider({ children }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setIsLoading]);

  return children;
}
