import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/supabase';

interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product & { selectedSize: string }) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find(
          item => item.id === product.id && item.selectedSize === product.selectedSize
        );

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id && item.selectedSize === product.selectedSize
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({
            items: [...items, { ...product, quantity: 1 }]
          });
        }
      },

      removeItem: (productId, size) => {
        set({
          items: get().items.filter(
            item => !(item.id === productId && item.selectedSize === size)
          )
        });
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }

        set({
          items: get().items.map(item =>
            item.id === productId && item.selectedSize === size
              ? { ...item, quantity }
              : item
          )
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);