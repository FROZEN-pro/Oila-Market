// ============================================================
// OILA MARKET - TypeScript Types
// ============================================================

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface User {
  id: string;
  telegramId: number;
  name: string;
  username?: string;
  phone?: string;
  photo?: string;
  address?: string;
  addresses?: Address[];
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  isBlocked?: boolean;
}

export interface Address {
  id: string;
  title: string;
  address: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image?: string;
  description?: string;
  productCount?: number;
  isActive: boolean;
  order?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  categoryId: string;
  categoryName?: string;
  images: string[];
  image?: string;
  inStock: boolean;
  quantity?: number;
  unit?: string;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  tags?: string[];
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  userTelegramId?: number;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  promoCode?: string;
  total: number;
  address: string;
  note?: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes?: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  gradient?: string;
  productId?: string;
  categoryId?: string;
  url?: string;
  isActive: boolean;
  order?: number;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  discount: number;
  minOrder?: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface StoreSettings {
  name: string;
  phone: string;
  address: string;
  telegramChannel?: string;
  deliveryFee: number;
  freeDeliveryFrom: number;
  minOrder: number;
  isOpen: boolean;
  closedMessage?: string;
  bannerTitle?: string;
  bannerText?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  userId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}
