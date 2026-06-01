// ============================================================
// 🏪 OILA MARKET - Google Apps Script Backend v2.0
// ============================================================
// Bu faylni Google Apps Script'ga nusxalang
// Script URL: https://script.google.com/
// Spreadsheet sheet nomlari:
//   - Products (Mahsulotlar)
//   - Categories (Kategoriyalar)
//   - Orders (Buyurtmalar)
//   - Users (Foydalanuvchilar)
//   - Reviews (Sharhlar)
//   - Banners (Bannerlar)
//   - PromoCodes (Promo kodlar)
//   - Settings (Sozlamalar)
//   - Messages (Xabarlar)
// ============================================================

// ─── Config ───────────────────────────────────────────────
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // <-- O'zgartiring
const TELEGRAM_BOT_TOKEN_USER = 'YOUR_USER_BOT_TOKEN'; // <-- O'zgartiring
const TELEGRAM_BOT_TOKEN_ADMIN = 'YOUR_ADMIN_BOT_TOKEN'; // <-- O'zgartiring
const ADMIN_TELEGRAM_IDS = [123456789]; // <-- Admin Telegram IDlarini qo'shing

// ─── Sheet Names ──────────────────────────────────────────
const SHEETS = {
  PRODUCTS: 'Products',
  CATEGORIES: 'Categories',
  ORDERS: 'Orders',
  USERS: 'Users',
  REVIEWS: 'Reviews',
  BANNERS: 'Banners',
  PROMO_CODES: 'PromoCodes',
  SETTINGS: 'Settings',
  MESSAGES: 'Messages',
};

// ─── CORS Headers ─────────────────────────────────────────
function addCorsHeaders(output) {
  return output
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ─── Response Helper ──────────────────────────────────────
function respond(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify({ success: true, data: data, timestamp: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
  return addCorsHeaders(output);
}

function respondError(message, code) {
  const output = ContentService
    .createTextOutput(JSON.stringify({ success: false, error: message, code: code || 400 }))
    .setMimeType(ContentService.MimeType.JSON);
  return addCorsHeaders(output);
}

// ─── Spreadsheet Helper ───────────────────────────────────
function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    initSheetHeaders(sheet, name);
  }
  return sheet;
}

function initSheetHeaders(sheet, name) {
  const headers = {
    Products: ['id', 'name', 'description', 'price', 'oldPrice', 'discount', 'categoryId', 'categoryName', 'images', 'image', 'inStock', 'quantity', 'unit', 'rating', 'reviewCount', 'isFeatured', 'isNew', 'tags', 'createdAt'],
    Categories: ['id', 'name', 'icon', 'image', 'description', 'productCount', 'isActive', 'order'],
    Orders: ['id', 'userId', 'userName', 'userPhone', 'userTelegramId', 'items', 'subtotal', 'deliveryFee', 'discount', 'promoCode', 'total', 'address', 'note', 'status', 'paymentMethod', 'createdAt', 'updatedAt'],
    Users: ['id', 'telegramId', 'name', 'username', 'phone', 'photo', 'address', 'addresses', 'createdAt', 'totalOrders', 'totalSpent', 'isBlocked'],
    Reviews: ['id', 'productId', 'userId', 'userName', 'userPhoto', 'rating', 'comment', 'createdAt', 'likes'],
    Banners: ['id', 'title', 'subtitle', 'image', 'gradient', 'productId', 'categoryId', 'url', 'isActive', 'order'],
    PromoCodes: ['id', 'code', 'type', 'discount', 'minOrder', 'maxUses', 'usedCount', 'isActive', 'expiresAt', 'createdAt'],
    Settings: ['key', 'value'],
    Messages: ['id', 'senderId', 'senderName', 'receiverId', 'text', 'isRead', 'createdAt'],
  };
  if (headers[name]) sheet.appendRow(headers[name]);
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let val = row[i];
      if (typeof val === 'string') {
        try { val = JSON.parse(val); } catch (e) { /* keep as string */ }
      }
      obj[h] = val;
    });
    return obj;
  }).filter(obj => obj.id || obj.key);
}

function objectToRow(sheet, obj) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.map(h => {
    const val = obj[h];
    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
    return val !== undefined ? val : '';
  });
}

// ─── doGet ────────────────────────────────────────────────
function doGet(e) {
  try {
    const action = e.parameter.action || '';
    
    switch (action) {
      // Products
      case 'getProducts': return respond(sheetToObjects(getSheet(SHEETS.PRODUCTS)));
      case 'getProduct': return respond(getById(SHEETS.PRODUCTS, e.parameter.id));
      case 'getFeaturedProducts': return respond(sheetToObjects(getSheet(SHEETS.PRODUCTS)).filter(p => p.isFeatured === true || p.isFeatured === 'true'));
      
      // Categories
      case 'getCategories': return respond(sheetToObjects(getSheet(SHEETS.CATEGORIES)).filter(c => c.isActive !== false));
      
      // Orders
      case 'getOrders': return respond(sheetToObjects(getSheet(SHEETS.ORDERS)).reverse());
      case 'getUserOrders': {
        const orders = sheetToObjects(getSheet(SHEETS.ORDERS));
        return respond(orders.filter(o => o.userId === e.parameter.userId).reverse());
      }
      
      // Users
      case 'getUsers': return respond(sheetToObjects(getSheet(SHEETS.USERS)));
      case 'getUser': {
        const users = sheetToObjects(getSheet(SHEETS.USERS));
        const user = users.find(u => String(u.telegramId) === String(e.parameter.telegramId));
        return respond(user || null);
      }
      
      // Reviews
      case 'getReviews': {
        const reviews = sheetToObjects(getSheet(SHEETS.REVIEWS));
        return respond(reviews.filter(r => r.productId === e.parameter.productId));
      }
      
      // Banners
      case 'getBanners': return respond(sheetToObjects(getSheet(SHEETS.BANNERS)).filter(b => b.isActive !== false));
      
      // Promo Codes
      case 'getPromoCodes': return respond(sheetToObjects(getSheet(SHEETS.PROMO_CODES)));
      case 'validatePromoCode': {
        const codes = sheetToObjects(getSheet(SHEETS.PROMO_CODES));
        const code = codes.find(c => c.code === e.parameter.code && (c.isActive === true || c.isActive === 'true'));
        if (!code) return respond({ valid: false, message: 'Promo kod topilmadi' });
        const total = Number(e.parameter.total || 0);
        if (code.minOrder && total < Number(code.minOrder)) {
          return respond({ valid: false, message: `Minimal buyurtma: ${Number(code.minOrder).toLocaleString()} so'm` });
        }
        if (code.maxUses && Number(code.usedCount) >= Number(code.maxUses)) {
          return respond({ valid: false, message: 'Promo kod limiti tugadi' });
        }
        const discount = code.type === 'percent' ? Math.round(total * Number(code.discount) / 100) : Number(code.discount);
        return respond({ valid: true, discount: discount, code: code });
      }
      
      // Settings
      case 'getSettings': {
        const settings = {};
        sheetToObjects(getSheet(SHEETS.SETTINGS)).forEach(row => {
          settings[row.key] = row.value;
        });
        return respond(settings);
      }
      
      // Stats
      case 'getStats': return respond(getStats());
      case 'getWeeklyStats': return respond(getWeeklyStats());
      
      // Messages
      case 'getMessages': {
        const msgs = sheetToObjects(getSheet(SHEETS.MESSAGES));
        return respond(msgs.filter(m => m.senderId === e.parameter.userId || m.receiverId === e.parameter.userId));
      }
      
      default: return respond({ message: 'Oila Market API v2.0', status: 'online' });
    }
  } catch (err) {
    return respondError(err.message);
  }
}

// ─── doPost ───────────────────────────────────────────────
function doPost(e) {
  try {
    let action = '';
    let data = {};
    
    if (e.postData && e.postData.type === 'application/json') {
      const body = JSON.parse(e.postData.contents);
      action = body.action || e.parameter.action || '';
      data = body.data || body;
    } else if (e.parameter.action) {
      action = e.parameter.action;
      try { data = JSON.parse(e.parameter.data || '{}'); } catch { data = {}; }
    } else if (e.postData) {
      const formData = e.postData.contents;
      const params = {};
      formData.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        params[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
      action = params.action || '';
      try { data = JSON.parse(params.data || '{}'); } catch { data = {}; }
    }
    
    switch (action) {
      // Products
      case 'addProduct': return respond(addToSheet(SHEETS.PRODUCTS, { ...data, createdAt: new Date().toISOString() }));
      case 'updateProduct': return respond(updateInSheet(SHEETS.PRODUCTS, data.id, data));
      case 'deleteProduct': return respond(deleteFromSheet(SHEETS.PRODUCTS, data.id));
      
      // Categories
      case 'addCategory': return respond(addToSheet(SHEETS.CATEGORIES, { ...data, createdAt: new Date().toISOString() }));
      case 'updateCategory': return respond(updateInSheet(SHEETS.CATEGORIES, data.id, data));
      case 'deleteCategory': return respond(deleteFromSheet(SHEETS.CATEGORIES, data.id));
      
      // Orders
      case 'createOrder': {
        const order = { ...data, createdAt: data.createdAt || new Date().toISOString() };
        addToSheet(SHEETS.ORDERS, order);
        // Send notifications
        notifyAdmin(order);
        notifyUser(order);
        // Update user stats
        updateUserStats(order.userId, order.total);
        return respond(order);
      }
      case 'updateOrderStatus': {
        const result = updateInSheet(SHEETS.ORDERS, data.id, { status: data.status, updatedAt: new Date().toISOString() });
        // Notify user about status change
        notifyUserOrderStatus(data.id, data.status, data.note);
        return respond(result);
      }
      
      // Users
      case 'saveUser': {
        const users = sheetToObjects(getSheet(SHEETS.USERS));
        const existing = users.find(u => String(u.telegramId) === String(data.telegramId));
        if (existing) {
          return respond(updateInSheet(SHEETS.USERS, existing.id, { ...data, id: existing.id }));
        } else {
          const newUser = { ...data, id: data.id || String(Date.now()), createdAt: new Date().toISOString(), totalOrders: 0, totalSpent: 0 };
          return respond(addToSheet(SHEETS.USERS, newUser));
        }
      }
      case 'updateUser': return respond(updateUserByTelegramId(data.telegramId, data));
      case 'blockUser': return respond(updateInSheet(SHEETS.USERS, data.userId, { isBlocked: data.blocked }));
      
      // Reviews
      case 'addReview': {
        const review = { ...data, id: String(Date.now()), createdAt: new Date().toISOString(), likes: 0 };
        addToSheet(SHEETS.REVIEWS, review);
        updateProductRating(review.productId);
        return respond(review);
      }
      case 'deleteReview': return respond(deleteFromSheet(SHEETS.REVIEWS, data.id));
      
      // Banners
      case 'saveBanner': {
        if (data.id) {
          const existing = getById(SHEETS.BANNERS, data.id);
          if (existing) return respond(updateInSheet(SHEETS.BANNERS, data.id, data));
        }
        return respond(addToSheet(SHEETS.BANNERS, { ...data, id: String(Date.now()) }));
      }
      case 'deleteBanner': return respond(deleteFromSheet(SHEETS.BANNERS, data.id));
      
      // Promo Codes
      case 'addPromoCode': return respond(addToSheet(SHEETS.PROMO_CODES, { ...data, id: String(Date.now()), usedCount: 0, createdAt: new Date().toISOString() }));
      case 'deletePromoCode': return respond(deleteFromSheet(SHEETS.PROMO_CODES, data.id));
      case 'usePromoCode': {
        const codes = sheetToObjects(getSheet(SHEETS.PROMO_CODES));
        const code = codes.find(c => c.code === data.code);
        if (code) updateInSheet(SHEETS.PROMO_CODES, code.id, { usedCount: (Number(code.usedCount) || 0) + 1 });
        return respond({ success: true });
      }
      
      // Settings
      case 'saveSettings': {
        const sheet = getSheet(SHEETS.SETTINGS);
        Object.entries(data).forEach(([key, value]) => {
          const existing = sheetToObjects(sheet).find(r => r.key === key);
          if (existing) {
            updateInSheet(SHEETS.SETTINGS, null, { value }, row => row.key === key);
          } else {
            sheet.appendRow([key, typeof value === 'object' ? JSON.stringify(value) : value]);
          }
        });
        return respond({ saved: true });
      }
      
      // Messages
      case 'sendMessage': {
        const msg = { id: String(Date.now()), senderId: 'admin', senderName: 'Admin', receiverId: data.userId, text: data.text, isRead: false, createdAt: new Date().toISOString() };
        addToSheet(SHEETS.MESSAGES, msg);
        // Send via Telegram Bot
        if (data.telegramId) sendTelegramMessage(data.telegramId, data.text, TELEGRAM_BOT_TOKEN_USER);
        return respond(msg);
      }
      
      default: return respondError('Unknown action: ' + action, 404);
    }
  } catch (err) {
    return respondError(err.message);
  }
}

// ─── CRUD Helpers ─────────────────────────────────────────
function addToSheet(sheetName, obj) {
  const sheet = getSheet(sheetName);
  const row = objectToRow(sheet, obj);
  sheet.appendRow(row);
  return obj;
}

function getById(sheetName, id) {
  return sheetToObjects(getSheet(sheetName)).find(obj => String(obj.id) === String(id)) || null;
}

function updateInSheet(sheetName, id, updates, filterFn) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const matches = filterFn ? filterFn(Object.fromEntries(headers.map((h, j) => [h, row[j]]))) : (String(row[idIdx]) === String(id));
    if (matches) {
      Object.entries(updates).forEach(([key, value]) => {
        const colIdx = headers.indexOf(key);
        if (colIdx >= 0) {
          const val = typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
          sheet.getRange(i + 1, colIdx + 1).setValue(val);
        }
      });
      return { updated: true, id };
    }
  }
  return { updated: false };
}

function deleteFromSheet(sheetName, id) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idIdx]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { deleted: true, id };
    }
  }
  return { deleted: false };
}

function updateUserByTelegramId(telegramId, updates) {
  const users = sheetToObjects(getSheet(SHEETS.USERS));
  const user = users.find(u => String(u.telegramId) === String(telegramId));
  if (user) return updateInSheet(SHEETS.USERS, user.id, updates);
  return { updated: false };
}

function updateUserStats(userId, orderTotal) {
  const users = sheetToObjects(getSheet(SHEETS.USERS));
  const user = users.find(u => u.id === userId);
  if (user) {
    const totalOrders = (Number(user.totalOrders) || 0) + 1;
    const totalSpent = (Number(user.totalSpent) || 0) + Number(orderTotal);
    updateInSheet(SHEETS.USERS, user.id, { totalOrders, totalSpent });
  }
}

function updateProductRating(productId) {
  const reviews = sheetToObjects(getSheet(SHEETS.REVIEWS)).filter(r => r.productId === productId);
  if (!reviews.length) return;
  const avg = reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length;
  updateInSheet(SHEETS.PRODUCTS, productId, { rating: avg.toFixed(1), reviewCount: reviews.length });
}

// ─── Stats ────────────────────────────────────────────────
function getStats() {
  const orders = sheetToObjects(getSheet(SHEETS.ORDERS));
  const users = sheetToObjects(getSheet(SHEETS.USERS));
  const products = sheetToObjects(getSheet(SHEETS.PRODUCTS));
  
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
  const newUsers = users.filter(u => new Date(u.createdAt) > oneWeekAgo);
  
  return {
    totalOrders: orders.length,
    todayOrders: todayOrders.length,
    totalRevenue: deliveredOrders.reduce((s, o) => s + Number(o.total), 0),
    todayRevenue: todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total), 0),
    totalUsers: users.length,
    newUsers: newUsers.length,
    totalProducts: products.length,
    inStockProducts: products.filter(p => p.inStock === true || p.inStock === 'true').length,
    pendingOrders: orders.filter(o => ['new', 'confirmed', 'preparing'].includes(o.status)).length,
  };
}

function getWeeklyStats() {
  const orders = sheetToObjects(getSheet(SHEETS.ORDERS));
  const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];
  const result = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === date.toDateString());
    result.push({
      day: days[date.getDay()],
      date: date.toDateString(),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
    });
  }
  return result;
}

// ─── Telegram Notifications ───────────────────────────────
function sendTelegramMessage(chatId, text, botToken) {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
      muteHttpExceptions: true,
    });
  } catch (err) {
    console.error('Telegram error:', err);
  }
}

function notifyAdmin(order) {
  const items = Array.isArray(order.items) ? order.items.map(i => `  • ${i.productName || 'Mahsulot'} x${i.quantity}`).join('\n') : '';
  const text = `🛒 <b>Yangi buyurtma!</b>\n\n📦 #${order.id}\n👤 ${order.userName}\n📞 ${order.userPhone || '-'}\n📍 ${order.address}\n\n${items}\n\n💰 Jami: <b>${Number(order.total).toLocaleString()} so'm</b>\n💳 To'lov: ${order.paymentMethod}\n\n⏰ ${new Date().toLocaleString('uz-UZ')}`;
  
  ADMIN_TELEGRAM_IDS.forEach(adminId => {
    sendTelegramMessage(adminId, text, TELEGRAM_BOT_TOKEN_ADMIN);
  });
}

function notifyUser(order) {
  if (!order.userTelegramId) return;
  const text = `✅ <b>Buyurtmangiz qabul qilindi!</b>\n\n📦 Buyurtma #${order.id}\n💰 Jami: ${Number(order.total).toLocaleString()} so'm\n📍 ${order.address}\n\n⏳ Tez orada siz bilan bog'lanamiz!`;
  sendTelegramMessage(order.userTelegramId, text, TELEGRAM_BOT_TOKEN_USER);
}

function notifyUserOrderStatus(orderId, status, note) {
  const orders = sheetToObjects(getSheet(SHEETS.ORDERS));
  const order = orders.find(o => o.id === orderId);
  if (!order || !order.userTelegramId) return;
  
  const statusMessages = {
    confirmed: '✅ Buyurtmangiz tasdiqlandi!',
    preparing: '🔄 Buyurtmangiz tayyorlanmoqda...',
    delivering: '🚚 Buyurtmangiz yo\'lda! Yetkazuvchi qo\'ng\'iroq qiladi.',
    delivered: '🎉 Buyurtmangiz yetkazildi! Rahmat!',
    cancelled: '❌ Buyurtmangiz bekor qilindi.',
  };
  
  const msg = statusMessages[status];
  if (!msg) return;
  
  const text = `${msg}\n\n📦 Buyurtma #${orderId}${note ? `\n\n📝 Izoh: ${note}` : ''}`;
  sendTelegramMessage(order.userTelegramId, text, TELEGRAM_BOT_TOKEN_USER);
}

// ─── Telegram Webhook (optional) ──────────────────────────
function setWebhook() {
  // Run this function once to set up webhook
  const webAppUrl = ScriptApp.getService().getUrl();
  
  // User bot
  UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN_USER}/setWebhook`, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ url: webAppUrl + '?bot=user' }),
  });
  
  // Admin bot
  UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN_ADMIN}/setWebhook`, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ url: webAppUrl + '?bot=admin' }),
  });
  
  console.log('Webhooks set!');
}

// ─── Bot Command Handler ──────────────────────────────────
function handleBotUpdate(update, botType) {
  if (!update.message) return;
  const chatId = update.message.chat.id;
  const text = update.message.text || '';
  const token = botType === 'admin' ? TELEGRAM_BOT_TOKEN_ADMIN : TELEGRAM_BOT_TOKEN_USER;
  
  if (botType === 'admin') {
    // Admin bot commands
    if (text === '/start') {
      if (!ADMIN_TELEGRAM_IDS.includes(chatId)) {
        sendTelegramMessage(chatId, '❌ Sizga ruxsat yo\'q!', token);
        return;
      }
      sendTelegramMessage(chatId, '🛡️ Admin panelga xush kelibsiz!\n\n/stats - Statistika\n/orders - Buyurtmalar\n/users - Foydalanuvchilar', token);
    } else if (text === '/stats' && ADMIN_TELEGRAM_IDS.includes(chatId)) {
      const stats = getStats();
      const msg = `📊 <b>Statistika</b>\n\n📦 Jami buyurtmalar: ${stats.totalOrders}\n🆕 Bugungi: ${stats.todayOrders}\n💰 Jami daromad: ${Number(stats.totalRevenue).toLocaleString()} so'm\n👥 Foydalanuvchilar: ${stats.totalUsers}\n🛍️ Mahsulotlar: ${stats.totalProducts}`;
      sendTelegramMessage(chatId, msg, token);
    } else if (text === '/orders' && ADMIN_TELEGRAM_IDS.includes(chatId)) {
      const orders = sheetToObjects(getSheet(SHEETS.ORDERS)).filter(o => o.status === 'new').slice(0, 5);
      const msg = orders.length ? `🆕 <b>Yangi buyurtmalar (${orders.length}):</b>\n\n` + orders.map(o => `#${o.id} - ${o.userName} - ${Number(o.total).toLocaleString()} so'm`).join('\n') : '✅ Yangi buyurtma yo\'q';
      sendTelegramMessage(chatId, msg, token);
    }
  } else {
    // User bot commands
    if (text === '/start') {
      const msg = `🏪 <b>Oila Market'ga xush kelibsiz!</b>\n\nOnline do'konimizda eng yangi va sifatli mahsulotlarni topasiz.\n\n🛒 Buyurtma berish uchun pastdagi tugmani bosing!`;
      const keyboard = {
        inline_keyboard: [[{ text: '🛍️ Do\'konga kirish', web_app: { url: 'YOUR_USER_APP_URL' } }]]
      };
      sendTelegramMessageWithKeyboard(chatId, msg, keyboard, token);
    } else if (text === '/orders') {
      const orders = sheetToObjects(getSheet(SHEETS.ORDERS)).filter(o => String(o.userTelegramId) === String(chatId)).slice(0, 5);
      const msg = orders.length ? `📦 <b>Sizning buyurtmalaringiz:</b>\n\n` + orders.map(o => `#${o.id} - ${o.status} - ${Number(o.total).toLocaleString()} so'm`).join('\n') : '📭 Buyurtmalar yo\'q';
      sendTelegramMessage(chatId, msg, token);
    }
  }
}

function sendTelegramMessageWithKeyboard(chatId, text, keyboard, botToken) {
  try {
    UrlFetchApp.fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', reply_markup: JSON.stringify(keyboard) }),
      muteHttpExceptions: true,
    });
  } catch (err) { console.error(err); }
}

// ─── Setup Function ───────────────────────────────────────
function setupSpreadsheet() {
  // Run once to create all sheets with headers
  Object.values(SHEETS).forEach(sheetName => {
    const sheet = getSheet(sheetName);
    if (sheet.getLastRow() === 0) {
      initSheetHeaders(sheet, sheetName);
    }
    console.log(`✅ ${sheetName} sheet ready`);
  });
  
  // Add default settings
  const settingsSheet = getSheet(SHEETS.SETTINGS);
  const defaults = [
    ['name', 'Oila Market'],
    ['phone', '+998 90 000 00 00'],
    ['address', 'Toshkent, O\'zbekiston'],
    ['deliveryFee', '15000'],
    ['freeDeliveryFrom', '150000'],
    ['minOrder', '20000'],
    ['isOpen', 'true'],
  ];
  defaults.forEach(([key, value]) => {
    const existing = sheetToObjects(settingsSheet).find(r => r.key === key);
    if (!existing) settingsSheet.appendRow([key, value]);
  });
  
  console.log('✅ Spreadsheet setup complete!');
}
