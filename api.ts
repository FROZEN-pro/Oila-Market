// ============================================================
// OILA MARKET - API Service (Google Apps Script Backend)
// ============================================================
import { API_URL, IMGBB_API_KEY, IMGBB_UPLOAD_URL } from './config';

const apiFetch = async (params: Record<string, string>, method: 'GET' | 'POST' = 'GET', body?: object) => {
  try {
    if (method === 'GET') {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}?${query}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } else {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_URL}?${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        mode: 'no-cors',
      });
      // no-cors returns opaque response, assume success
      return { success: true };
    }
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: String(error) };
  }
};

// POST with JSONP workaround for Apps Script
const apiPost = async (action: string, data: object) => {
  try {
    const form = new FormData();
    form.append('action', action);
    form.append('data', JSON.stringify(data));
    const res = await fetch(API_URL, {
      method: 'POST',
      body: form,
      mode: 'no-cors',
    });
    if (res.type === 'opaque') return { success: true };
    return await res.json();
  } catch (err) {
    return { success: true }; // Optimistic
  }
};

// ── Products ──────────────────────────────────────────────
export const getProducts = () => apiFetch({ action: 'getProducts' });
export const getProduct = (id: string) => apiFetch({ action: 'getProduct', id });
export const addProduct = (data: object) => apiPost('addProduct', data);
export const updateProduct = (id: string, data: object) => apiPost('updateProduct', { id, ...data });
export const deleteProduct = (id: string) => apiPost('deleteProduct', { id });
export const getFeaturedProducts = () => apiFetch({ action: 'getFeaturedProducts' });

// ── Categories ────────────────────────────────────────────
export const getCategories = () => apiFetch({ action: 'getCategories' });
export const addCategory = (data: object) => apiPost('addCategory', data);
export const updateCategory = (id: string, data: object) => apiPost('updateCategory', { id, ...data });
export const deleteCategory = (id: string) => apiPost('deleteCategory', { id });

// ── Orders ────────────────────────────────────────────────
export const getOrders = () => apiFetch({ action: 'getOrders' });
export const getUserOrders = (userId: string) => apiFetch({ action: 'getUserOrders', userId });
export const createOrder = (data: object) => apiPost('createOrder', data);
export const updateOrderStatus = (id: string, status: string, note?: string) =>
  apiPost('updateOrderStatus', { id, status, note });

// ── Users ─────────────────────────────────────────────────
export const getUsers = () => apiFetch({ action: 'getUsers' });
export const getUser = (telegramId: number) => apiFetch({ action: 'getUser', telegramId: String(telegramId) });
export const saveUser = (data: object) => apiPost('saveUser', data);
export const updateUserProfile = (telegramId: number, data: object) =>
  apiPost('updateUser', { telegramId, ...data });
export const blockUser = (userId: string, blocked: boolean) =>
  apiPost('blockUser', { userId, blocked });

// ── Reviews ───────────────────────────────────────────────
export const getReviews = (productId: string) => apiFetch({ action: 'getReviews', productId });
export const addReview = (data: object) => apiPost('addReview', data);
export const deleteReview = (id: string) => apiPost('deleteReview', { id });

// ── Banners ───────────────────────────────────────────────
export const getBanners = () => apiFetch({ action: 'getBanners' });
export const saveBanner = (data: object) => apiPost('saveBanner', data);
export const deleteBanner = (id: string) => apiPost('deleteBanner', { id });

// ── Promo Codes ───────────────────────────────────────────
export const getPromoCodes = () => apiFetch({ action: 'getPromoCodes' });
export const validatePromoCode = (code: string, total: number) =>
  apiFetch({ action: 'validatePromoCode', code, total: String(total) });
export const addPromoCode = (data: object) => apiPost('addPromoCode', data);
export const deletePromoCode = (id: string) => apiPost('deletePromoCode', { id });

// ── Settings ──────────────────────────────────────────────
export const getSettings = () => apiFetch({ action: 'getSettings' });
export const saveSettings = (data: object) => apiPost('saveSettings', data);

// ── Statistics ────────────────────────────────────────────
export const getStats = () => apiFetch({ action: 'getStats' });
export const getWeeklyStats = () => apiFetch({ action: 'getWeeklyStats' });

// ── Messages ──────────────────────────────────────────────
export const sendMessage = (data: object) => apiPost('sendMessage', data);
export const getMessages = (userId: string) => apiFetch({ action: 'getMessages', userId });

// ── Image Upload (ImgBB) ──────────────────────────────────
export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const formData = new FormData();
        formData.append('image', base64);
        formData.append('key', IMGBB_API_KEY);
        const res = await fetch(IMGBB_UPLOAD_URL, {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (json.success) {
          resolve(json.data.url);
        } else {
          resolve(null);
        }
      };
      reader.readAsDataURL(file);
    });
  } catch {
    return null;
  }
};
