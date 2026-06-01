// ============================================================
// OILA MARKET - Zustand Global Store
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, User, Notification } from './types';

interface AppStore {
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Notifications
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: () => number;

  // Search history
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;

  // Active tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Admin
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  adminTab: string;
  setAdminTab: (tab: string) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Theme
      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      // User
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      updateUser: (updates) =>
        set((s) => ({
          currentUser: s.currentUser ? { ...s.currentUser, ...updates } : null,
        })),

      // Cart
      cart: [],
      addToCart: (product, qty = 1) =>
        set((s) => {
          const existing = s.cart.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              cart: s.cart.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { cart: [...s.cart, { product, quantity: qty }] };
        }),
      removeFromCart: (productId) =>
        set((s) => ({ cart: s.cart.filter((i) => i.product.id !== productId) })),
      updateCartItem: (productId, qty) =>
        set((s) => ({
          cart:
            qty <= 0
              ? s.cart.filter((i) => i.product.id !== productId)
              : s.cart.map((i) =>
                  i.product.id === productId ? { ...i, quantity: qty } : i
                ),
        })),
      clearCart: () => set({ cart: [] }),
      cartTotal: () =>
        get().cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      cartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),

      // Wishlist
      wishlist: [],
      toggleWishlist: (productId) =>
        set((s) => ({
          wishlist: s.wishlist.includes(productId)
            ? s.wishlist.filter((id) => id !== productId)
            : [...s.wishlist, productId],
        })),
      isWishlisted: (productId) => get().wishlist.includes(productId),

      // Notifications
      notifications: [],
      addNotification: (n) =>
        set((s) => ({ notifications: [n, ...s.notifications].slice(0, 50) })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
      unreadCount: () => get().notifications.filter((n) => !n.isRead).length,

      // Search history
      searchHistory: [],
      addSearchHistory: (query) =>
        set((s) => ({
          searchHistory: [
            query,
            ...s.searchHistory.filter((q) => q !== query),
          ].slice(0, 10),
        })),
      clearSearchHistory: () => set({ searchHistory: [] }),

      // Active tab
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Admin
      isAdmin: false,
      setIsAdmin: (val) => set({ isAdmin: val }),
      adminTab: 'dashboard',
      setAdminTab: (tab) => set({ adminTab: tab }),
    }),
    {
      name: 'oila-market-store',
      partialize: (state) => ({
        darkMode: state.darkMode,
        cart: state.cart,
        wishlist: state.wishlist,
        currentUser: state.currentUser,
        searchHistory: state.searchHistory,
        notifications: state.notifications,
        isAdmin: state.isAdmin,
        activeTab: state.activeTab,
      }),
    }
  )
);
