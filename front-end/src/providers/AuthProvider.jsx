"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/auth.store";
import { useCurrentUser } from "@/hooks/queries/useAuth";

export default function AuthProvider({ children }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    setIsLoading(isLoading);
    if (user) {
      setUser(user);
    } else if (isError) {
      setUser(null);
    }
  }, [user, isLoading, isError, setUser, setIsLoading]);

  return children;
}
