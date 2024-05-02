import { create } from "zustand";
//zustand is a small and fast state management library for React applications 
//With zustand, you can create state containers called "stores" using a simple hook-based API.

type HeartsModalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useHeartsModal = create<HeartsModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));