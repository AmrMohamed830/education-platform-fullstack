import { create } from "zustand";

const useAuthStore = create((set) => ({
    user: null,
      isLoading: true,

    setUser: (userData) => {
    set({ user: userData });
    },

    setIsLoading:(value)=>{
        set({isLoading:value})
    },
    logout: () => {
    set({
        user: null,
    });
    },
}));

export default useAuthStore;
