import { create } from "zustand";

const useCartStore = create((set) => ({
  items: [],

  addItem: (product) =>
    set((state) => ({
      items: [...state.items, product],
    })),
}));

export default useCartStore;