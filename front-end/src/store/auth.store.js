import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isLoggingOut: false,

      setUser: (userData) => {
        set({ user: userData, isLoading: false });
      },

      setIsLoading: (value) => {
        set({ isLoading: value });
      },

      logout: () => {
        set({
          user: null,
          isLoading: false,
        });
      },

      setIsLoggingOut: (value) => set({ isLoggingOut: value }),
    }),
    {
      name: "education_auth_state",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : null)),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;
