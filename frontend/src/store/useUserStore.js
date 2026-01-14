import { create } from "zustand";
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      setCurrentUser: (userData) => set({ currentUser: userData , isAuthenticated: true}),
      clearCurrentUser: () => set({ currentUser: null, isAuthenticated: false }),
    }),
    {
      name: "user-storage",
      getStorage: () => localStorage,
    }
  )
);

export default useUserStore;