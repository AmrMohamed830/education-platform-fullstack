import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  isLoggingOut: false,

  setUser: (userData) => {
    set({ user: userData });
  },

  setIsLoading: (value) => {
    set({ isLoading: value });
  },
  logout: () => {
    set({
      user: null,
    });
  },
  setIsLoggingOut: (value) => set({ isLoggingOut: value }),
}));

export default useAuthStore;
