"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/auth.store";

const ProtectedLayout = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const setIsLoggingOut = useAuthStore((state) => state.setIsLoggingOut);

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && !isLoggingOut) {
      router.replace("/login");
    }
  }, [user, isLoading, isLoggingOut, router]);

  useEffect(() => {
    return () => {
      setIsLoggingOut(false);
    };
  }, [setIsLoggingOut]);

  if (isLoading || !user) {
    return <p>جاري التحقق من تسجيل الدخول...</p>;
  }

  return children;
};

export default ProtectedLayout;