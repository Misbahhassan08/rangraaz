import { create } from "zustand";
import { persist } from "zustand/middleware";

const productStore = create(
  persist(
    (set, get) => ({
      // Quantity (default for adding new items)
      quantity: 1,
      increaseQuantity: () =>
        set((state) => ({ quantity: state.quantity + 1 })),
      decreaseQuantity: () =>
        set((state) => ({
          quantity: state.quantity > 1 ? state.quantity - 1 : 1,
        })),
      resetQuantity: () => set({ quantity: 1 }),

      // Favorites
      favorites: [],
      toggleFavorite: (product) =>
        set((state) => {
          const isFavorited = state.favorites.some(
            (item) => item.id === product.id
          );
          return {
            favorites: isFavorited
              ? state.favorites.filter((item) => item.id !== product.id)
              : [...state.favorites, product],
          };
        }),

      // Cart
      cart: [],
      addToCart: (product) =>
        set((state) => {
          const existingProduct = state.cart.find(
            (item) => item.id === product.id && item.size === product.size
          );

          if (existingProduct) {
            // Increase quantity if same product + size already exists
            return {
              cart: state.cart.map((item) =>
                item.id === product.id && item.size === product.size
                  ? { ...item, quantity: item.quantity + product.quantity }
                  : item
              ),
            };
          } else {
            // Add new product with its quantity
            return { cart: [...state.cart, product] };
          }
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      // Computed total price
      getTotalPrice: () =>
        get().cart.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        ),
    }),
    {
      name: "product-storage", // key in localStorage
    }
  )
);

export default productStore;
