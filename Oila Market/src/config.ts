// ============================================================
// OILA MARKET - Global Configuration
// ============================================================

export const API_URL = 'https://script.google.com/macros/s/AKfycbxIRfzbDDxrNh3LFxG1CxTNaYWM0x9WL12aa9GmvfskgYLKRcH30eW2Gcq1C2kj4CqI/exec';
export const IMGBB_API_KEY = 'ad433e82aae872eebbb30c5bfe3fac42'; // Replace with real imgbb key

export const APP_VERSION = '2.0.0';
export const STORE_NAME = 'Oila Market';
export const STORE_EMOJI = '🏪';
export const TELEGRAM_CHANNEL = '@oilamarket';
export const TELEGRAM_BOT_USER = '@QiziriqOilaMarketBot';
export const TELEGRAM_BOT_ADMIN = '@QiziriqOilaMarketAdminBot';

export const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
};

export const ORDER_STATUSES = [
  { key: 'new', label: '🆕 Yangi', color: 'blue' },
  { key: 'confirmed', label: '✅ Tasdiqlangan', color: 'green' },
  { key: 'preparing', label: '🔄 Tayyorlanmoqda', color: 'yellow' },
  { key: 'delivering', label: '🚚 Yetkazilmoqda', color: 'purple' },
  { key: 'delivered', label: '✔️ Yetkazildi', color: 'emerald' },
  { key: 'cancelled', label: '❌ Bekor', color: 'red' },
];

export const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';
