import { create } from "zustand";
import {persist} from 'zustand/middleware';


const useLoginStore = create(
  persist(
    (set) => ({
      step: 1,
      userPhoneNumber: null,
      setStep: (step) => set({ step }),
      setUserPhoneNumber: (data) => set({ userPhoneNumber: data }),
      resetLoginStore: () => set({ step: 1, userPhoneNumber: null }),
    }),
    {
      name: "login-storage",
      partialize: (state) => ({
        step: state.step,
        userPhoneNumber: state.userPhoneNumber,
      }),
    }
  )
);

export default useLoginStore;
