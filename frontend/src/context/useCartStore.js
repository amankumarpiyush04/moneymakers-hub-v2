import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('mmh_cart') || '[]'),
  cartOpen: false,

  setCartOpen: (isOpen) => set({ cartOpen: isOpen }),

  addItem: (product) => {
    if (get().hasItem(product._id)) return;
    const items = [...get().items, product];
    localStorage.setItem('mmh_cart', JSON.stringify(items));
    set({ items, cartOpen: true });
  },

  removeItem: (id) => {
    const items = get().items.filter(i => i._id !== id);
    localStorage.setItem('mmh_cart', JSON.stringify(items));
    set({ items });
  },

  clearCart: () => {
    localStorage.removeItem('mmh_cart');
    set({ items: [], cartOpen: false });
  },

  total:   () => get().items.reduce((sum, i) => sum + i.price, 0),
  count:   () => get().items.length,
  hasItem: (id) => get().items.some(i => i._id === id),
}));

export default useCartStore;
