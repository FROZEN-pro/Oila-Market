// ============================================
// OILA MARKET - GOOGLE APPS SCRIPT BACKEND v2
// ============================================

const SPREADSHEET_ID = '1f7C7a5Piw_2rQIMvxcqppnq6M3iofH1aZCUI_ANoMx0';
const IMGBB_API_KEY = 'ad433e82aae872eebbb30c5bfe3fac42';
const BOT_TOKEN = '8458201050:AAGk5lbgpSBl26ZpFDUUEoSNJy7a2qC7F_I';

// ============ SHEET HELPERS ============
function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    initSheet(sheet, name);
  }
  return sheet;
}

function initSheet(sheet, name) {
  const H = {
    'Products': ['id','name','category','price','oldPrice','image','description','stock','rating','sold','createdAt','isActive'],
    'Categories': ['id','name','icon','image','isActive','order'],
    'Users': ['id','telegramId','username','name','phone','address','avatar','role','createdAt','lastLogin','isActive'],
    'Orders': ['id','userId','userName','items','total','status','address','phone','note','deliveryType','promoCode','createdAt','updatedAt'],
    'Cart': ['id','userId','productId','quantity','addedAt'],
    'Reviews': ['id','productId','userId','userName','rating','comment','createdAt','isApproved'],
    'Banners': ['id','image','link','productId','isActive','order','createdAt'],
    'PromoCodes': ['id','code','discount','type','maxUses','usedCount','expiresAt','isActive'],
    'Settings': ['key','value'],
    'Notifications': ['id','userId','title','message','isRead','createdAt'],
    'Favorites': ['id','userId','productId','addedAt'],
    'ActivityLog': ['id','userId','action','details','createdAt'],
    'SupportMessages': ['id','userId','userName','message','isAdmin','createdAt','isRead']
  };
  if (H[name]) {
    sheet.getRange(1, 1, 1, H[name].length).setValues([H[name]]);
    sheet.getRange(1, 1, 1, H[name].length).setFontWeight('bold').setBackground('#6C63FF').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
}

function toJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function rowsToObjects(data) {
  if (!data || data.length <= 1) return [];
  const h = data[0], result = [];
  for (let i = 1; i < data.length; i++) {
    const o = {};
    for (let j = 0; j < h.length; j++) o[h[j]] = data[i][j];
    result.push(o);
  }
  return result;
}

function findRow(sheet, col, val) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][col]) === String(val)) return { row: i + 1, data: data[i], index: i };
  }
  return null;
}

// ============ ROUTING ============
function doGet(e) {
  try {
    const p = e.parameter || {};
    const action = p.action || '';
    return toJson(route(action, p));
  } catch (err) {
    return toJson({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const body = e.postData ? JSON.parse(e.postData.contents) : (e.parameter || {});
    const action = body.action || '';
    return toJson(route(action, body));
  } catch (err) {
    return toJson({ success: false, error: err.toString() });
  }
}

function route(action, b) {
  switch (action) {
    case 'getProducts': return getProducts(b);
    case 'getProduct': return getProduct(b);
    case 'addProduct': return addProduct(b);
    case 'updateProduct': return updateProduct(b);
    case 'deleteProduct': return deleteProduct(b);
    case 'searchProducts': return searchProducts(b);
    case 'getCategories': return getCategories();
    case 'addCategory': return addCategory(b);
    case 'updateCategory': return updateCategory(b);
    case 'deleteCategory': return deleteCategory(b);
    case 'loginUser': return loginUser(b);
    case 'getUser': return getUser(b);
    case 'updateProfile': return updateProfile(b);
    case 'getUsers': return getUsers();
    case 'toggleUserStatus': return toggleUserStatus(b);
    case 'getCart': return getCart(b);
    case 'addToCart': return addToCart(b);
    case 'updateCartItem': return updateCartItem(b);
    case 'removeFromCart': return removeFromCart(b);
    case 'clearCart': return clearCart(b);
    case 'createOrder': return createOrder(b);
    case 'getOrders': return getOrders(b);
    case 'getUserOrders': return getUserOrders(b);
    case 'updateOrderStatus': return updateOrderStatus(b);
    case 'deleteOrder': return deleteOrder(b);
    case 'addReview': return addReview(b);
    case 'getReviews': return getReviews(b);
    case 'approveReview': return approveReview(b);
    case 'deleteReview': return deleteReview(b);
    case 'getBanners': return getBanners();
    case 'addBanner': return addBanner(b);
    case 'updateBanner': return updateBanner(b);
    case 'deleteBanner': return deleteBanner(b);
    case 'getFavorites': return getFavorites(b);
    case 'toggleFavorite': return toggleFavorite(b);
    case 'getDashboard': return getDashboard();
    case 'getNotifications': return getNotifications(b);
    case 'markNotificationRead': return markNotifRead(b);
    case 'sendNotification': return sendNotification(b);
    case 'getSettings': return getSettings();
    case 'updateSetting': return updateSetting(b);
    case 'getActivityLog': return getActivityLog(b);
    case 'logActivity': return logActivity(b);
    case 'uploadImage': return uploadImage(b);
    case 'validatePromo': return validatePromo(b);
    case 'addPromoCode': return addPromoCode(b);
    case 'getPromoCodes': return getPromoCodes();
    case 'deletePromoCode': return deletePromoCode(b);
    case 'getSupportMessages': return getSupportMessages(b);
    case 'sendSupportMessage': return sendSupportMessage(b);
    case 'replySupport': return replySupport(b);
    default: return { success: false, error: 'Unknown: ' + action };
  }
}

// ============ PRODUCTS ============
function getProducts(p) {
  const sheet = getSheet('Products');
  let products = rowsToObjects(sheet.getDataRange().getValues());
  if (p.category && p.category !== 'all') products = products.filter(x => x.category === p.category);
  if (p.activeOnly === 'true' || p.activeOnly === true) products = products.filter(x => x.isActive === true || x.isActive === 'true' || x.isActive === 'TRUE');
  products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return { success: true, data: products };
}

function getProduct(b) {
  const sheet = getSheet('Products');
  const products = rowsToObjects(sheet.getDataRange().getValues());
  const p = products.find(x => x.id === b.id);
  return p ? { success: true, data: p } : { success: false, error: 'Not found' };
}

function addProduct(b) {
  const sheet = getSheet('Products');
  const id = 'P' + Date.now();
  sheet.appendRow([id, b.name, b.category || '', b.price || 0, b.oldPrice || '', b.image || '', b.description || '', b.stock || 0, 0, 0, new Date().toISOString(), true]);
  logActivity({ userId: 'admin', action: 'addProduct', details: b.name });
  return { success: true, data: { id } };
}

function updateProduct(b) {
  const sheet = getSheet('Products');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  const r = found.row;
  const cols = { name: 2, category: 3, price: 4, oldPrice: 5, image: 6, description: 7, stock: 8, rating: 9, sold: 10, isActive: 12 };
  for (const [key, col] of Object.entries(cols)) {
    if (b[key] !== undefined) sheet.getRange(r, col).setValue(b[key]);
  }
  logActivity({ userId: 'admin', action: 'updateProduct', details: b.id });
  return { success: true };
}

function deleteProduct(b) {
  const sheet = getSheet('Products');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.deleteRow(found.row);
  logActivity({ userId: 'admin', action: 'deleteProduct', details: b.id });
  return { success: true };
}

function searchProducts(p) {
  const sheet = getSheet('Products');
  const products = rowsToObjects(sheet.getDataRange().getValues());
  const q = (p.q || '').toLowerCase();
  return { success: true, data: products.filter(x => (x.name || '').toLowerCase().includes(q) || (x.description || '').toLowerCase().includes(q) || (x.category || '').toLowerCase().includes(q)) };
}

// ============ CATEGORIES ============
function getCategories() {
  const sheet = getSheet('Categories');
  const cats = rowsToObjects(sheet.getDataRange().getValues());
  cats.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  return { success: true, data: cats };
}

function addCategory(b) {
  const sheet = getSheet('Categories');
  const id = 'C' + Date.now();
  sheet.appendRow([id, b.name, b.icon || '📦', b.image || '', true, b.order || 0]);
  logActivity({ userId: 'admin', action: 'addCategory', details: b.name });
  return { success: true, data: { id } };
}

function updateCategory(b) {
  const sheet = getSheet('Categories');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  const r = found.row;
  if (b.name !== undefined) sheet.getRange(r, 2).setValue(b.name);
  if (b.icon !== undefined) sheet.getRange(r, 3).setValue(b.icon);
  if (b.image !== undefined) sheet.getRange(r, 4).setValue(b.image);
  if (b.isActive !== undefined) sheet.getRange(r, 5).setValue(b.isActive);
  if (b.order !== undefined) sheet.getRange(r, 6).setValue(b.order);
  logActivity({ userId: 'admin', action: 'updateCategory', details: b.id });
  return { success: true };
}

function deleteCategory(b) {
  const sheet = getSheet('Categories');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.deleteRow(found.row);
  logActivity({ userId: 'admin', action: 'deleteCategory', details: b.id });
  return { success: true };
}

// ============ USERS ============
function loginUser(b) {
  const sheet = getSheet('Users');
  const all = rowsToObjects(sheet.getDataRange().getValues());
  const tid = String(b.telegramId || '');
  let user = all.find(u => String(u.telegramId) === tid);
  if (!user) {
    const id = 'U' + Date.now();
    const now = new Date().toISOString();
    sheet.appendRow([id, tid, b.username || '', b.name || 'User', b.phone || '', b.address || '', b.avatar || '', 'user', now, now, true]);
    user = { id, telegramId: tid, username: b.username || '', name: b.name || 'User', phone: '', address: '', avatar: b.avatar || '', role: 'user', isActive: true };
    logActivity({ userId: id, action: 'register', details: b.name || 'New user' });
  } else {
    const found = findRow(sheet, 1, tid);
    if (found) {
      sheet.getRange(found.row, 10).setValue(new Date().toISOString());
      if (b.name && b.name !== 'User') sheet.getRange(found.row, 4).setValue(b.name);
      if (b.username) sheet.getRange(found.row, 3).setValue(b.username);
      if (b.avatar) sheet.getRange(found.row, 7).setValue(b.avatar);
      user.name = b.name || user.name;
      user.username = b.username || user.username;
      user.avatar = b.avatar || user.avatar;
    }
  }
  return { success: true, data: user };
}

function getUser(b) {
  const sheet = getSheet('Users');
  const all = rowsToObjects(sheet.getDataRange().getValues());
  const user = all.find(u => u.id === b.id || String(u.telegramId) === String(b.telegramId));
  return user ? { success: true, data: user } : { success: false, error: 'Not found' };
}

function updateProfile(b) {
  const sheet = getSheet('Users');
  const all = sheet.getDataRange().getValues();
  for (let i = 1; i < all.length; i++) {
    if (all[i][0] === b.id || String(all[i][1]) === String(b.telegramId)) {
      if (b.name !== undefined) sheet.getRange(i + 1, 4).setValue(b.name);
      if (b.username !== undefined) sheet.getRange(i + 1, 3).setValue(b.username);
      if (b.phone !== undefined) sheet.getRange(i + 1, 5).setValue(b.phone);
      if (b.address !== undefined) sheet.getRange(i + 1, 6).setValue(b.address);
      if (b.avatar !== undefined) sheet.getRange(i + 1, 7).setValue(b.avatar);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

function getUsers() {
  const sheet = getSheet('Users');
  const users = rowsToObjects(sheet.getDataRange().getValues());
  return { success: true, data: users };
}

function toggleUserStatus(b) {
  const sheet = getSheet('Users');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  const current = found.data[10];
  const newVal = !(current === true || current === 'true' || current === 'TRUE');
  sheet.getRange(found.row, 11).setValue(newVal);
  logActivity({ userId: 'admin', action: 'toggleUser', details: b.id + ' -> ' + newVal });
  return { success: true };
}

// ============ CART ============
function getCart(b) {
  const sheet = getSheet('Cart');
  let items = rowsToObjects(sheet.getDataRange().getValues());
  items = items.filter(c => String(c.userId) === String(b.userId));
  const pSheet = getSheet('Products');
  const products = rowsToObjects(pSheet.getDataRange().getValues());
  items = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product: product || null };
  });
  return { success: true, data: items };
}

function addToCart(b) {
  const sheet = getSheet('Cart');
  const all = rowsToObjects(sheet.getDataRange().getValues());
  const existing = all.find(c => String(c.userId) === String(b.userId) && c.productId === b.productId);
  if (existing) {
    const found = findRow(sheet, 0, existing.id);
    if (found) {
      sheet.getRange(found.row, 4).setValue(Number(existing.quantity) + Number(b.quantity || 1));
      return { success: true };
    }
  }
  const id = 'CI' + Date.now();
  sheet.appendRow([id, b.userId, b.productId, b.quantity || 1, new Date().toISOString()]);
  return { success: true, data: { id } };
}

function updateCartItem(b) {
  const sheet = getSheet('Cart');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.getRange(found.row, 4).setValue(Number(b.quantity));
  return { success: true };
}

function removeFromCart(b) {
  const sheet = getSheet('Cart');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.deleteRow(found.row);
  return { success: true };
}

function clearCart(b) {
  const sheet = getSheet('Cart');
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][1]) === String(b.userId)) sheet.deleteRow(i + 1);
  }
  return { success: true };
}

// ============ ORDERS ============
function createOrder(b) {
  const sheet = getSheet('Orders');
  const id = 'O' + Date.now();
  const itemsStr = typeof b.items === 'string' ? b.items : JSON.stringify(b.items || []);
  sheet.appendRow([id, b.userId, b.userName || '', itemsStr, b.total || 0, 'pending', b.address || '', b.phone || '', b.note || '', b.deliveryType || 'delivery', b.promoCode || '', new Date().toISOString(), new Date().toISOString()]);
  // Update sold count for products
  let items = b.items;
  if (typeof items === 'string') { try { items = JSON.parse(items); } catch (e) { items = []; } }
  if (Array.isArray(items)) {
    const pSheet = getSheet('Products');
    items.forEach(item => {
      const found = findRow(pSheet, 0, item.productId || item.id);
      if (found) {
        const currentSold = Number(found.data[9]) || 0;
        const currentStock = Number(found.data[7]) || 0;
        pSheet.getRange(found.row, 10).setValue(currentSold + Number(item.qty || item.quantity || 1));
        pSheet.getRange(found.row, 8).setValue(Math.max(0, currentStock - Number(item.qty || item.quantity || 1)));
      }
    });
  }
  // Apply promo code usage
  if (b.promoCode) {
    const promoSheet = getSheet('PromoCodes');
    const found = findRow(promoSheet, 1, b.promoCode);
    if (found) {
      promoSheet.getRange(found.row, 7).setValue(Number(found.data[6] || 0) + 1);
    }
  }
  clearCart({ userId: b.userId });
  sendNotification({ userId: b.userId, title: 'Buyurtma qabul qilindi! ✅', message: 'Buyurtmangiz #' + id.slice(-6) + ' qabul qilindi. Tez orada bog\'lanamiz!' });
  logActivity({ userId: b.userId, action: 'createOrder', details: id + ' ' + (b.total || 0) + ' so\'m' });
  return { success: true, data: { id } };
}

function getOrders(b) {
  const sheet = getSheet('Orders');
  let orders = rowsToObjects(sheet.getDataRange().getValues());
  if (b.status && b.status !== 'all') orders = orders.filter(o => o.status === b.status);
  orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return { success: true, data: orders };
}

function getUserOrders(b) {
  const sheet = getSheet('Orders');
  let orders = rowsToObjects(sheet.getDataRange().getValues());
  orders = orders.filter(o => String(o.userId) === String(b.userId));
  orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return { success: true, data: orders };
}

function updateOrderStatus(b) {
  const sheet = getSheet('Orders');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.getRange(found.row, 6).setValue(b.status);
  sheet.getRange(found.row, 13).setValue(new Date().toISOString());
  const statusText = { pending: 'Kutilmoqda', confirmed: 'Tasdiqlandi ✅', shipping: 'Yetkazilmoqda 🚚', delivered: 'Yetkazildi ✅', cancelled: 'Bekor qilindi ❌' };
  sendNotification({ userId: found.data[1], title: 'Buyurtma #' + b.id.slice(-6), message: statusText[b.status] || b.status });
  logActivity({ userId: 'admin', action: 'updateOrder', details: b.id + ' -> ' + b.status });
  return { success: true };
}

function deleteOrder(b) {
  const sheet = getSheet('Orders');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.deleteRow(found.row);
  logActivity({ userId: 'admin', action: 'deleteOrder', details: b.id });
  return { success: true };
}

// ============ REVIEWS ============
function addReview(b) {
  const sheet = getSheet('Reviews');
  const id = 'R' + Date.now();
  sheet.appendRow([id, b.productId, b.userId, b.userName || '', b.rating || 5, b.comment || '', new Date().toISOString(), false]);
  // Recalculate product rating
  recalcProductRating(b.productId);
  logActivity({ userId: b.userId, action: 'addReview', details: b.productId + ' ★' + b.rating });
  return { success: true, data: { id } };
}

function recalcProductRating(productId) {
  const rSheet = getSheet('Reviews');
  const reviews = rowsToObjects(rSheet.getDataRange().getValues());
  const approved = reviews.filter(r => r.productId === productId && (r.isApproved === true || r.isApproved === 'true' || r.isApproved === 'TRUE'));
  let avg = 0;
  if (approved.length > 0) {
    const sum = approved.reduce((s, r) => s + Number(r.rating || 0), 0);
    avg = Math.round((sum / approved.length) * 10) / 10;
  }
  const pSheet = getSheet('Products');
  const found = findRow(pSheet, 0, productId);
  if (found) pSheet.getRange(found.row, 9).setValue(avg);
}

function getReviews(b) {
  const sheet = getSheet('Reviews');
  let reviews = rowsToObjects(sheet.getDataRange().getValues());
  if (b.productId) reviews = reviews.filter(r => r.productId === b.productId);
  if (b.approvedOnly === 'true' || b.approvedOnly === true) reviews = reviews.filter(r => r.isApproved === true || r.isApproved === 'true' || r.isApproved === 'TRUE');
  reviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return { success: true, data: reviews };
}

function approveReview(b) {
  const sheet = getSheet('Reviews');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.getRange(found.row, 8).setValue(true);
  recalcProductRating(found.data[1]);
  logActivity({ userId: 'admin', action: 'approveReview', details: b.id });
  return { success: true };
}

function deleteReview(b) {
  const sheet = getSheet('Reviews');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  const productId = found.data[1];
  sheet.deleteRow(found.row);
  recalcProductRating(productId);
  logActivity({ userId: 'admin', action: 'deleteReview', details: b.id });
  return { success: true };
}

// ============ BANNERS ============
function getBanners() {
  const sheet = getSheet('Banners');
  let banners = rowsToObjects(sheet.getDataRange().getValues());
  banners = banners.filter(b => b.isActive === true || b.isActive === 'true' || b.isActive === 'TRUE');
  banners.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  return { success: true, data: banners };
}

function addBanner(b) {
  const sheet = getSheet('Banners');
  const id = 'B' + Date.now();
  sheet.appendRow([id, b.image || '', b.link || '', b.productId || '', true, b.order || 0, new Date().toISOString()]);
  logActivity({ userId: 'admin', action: 'addBanner', details: id });
  return { success: true, data: { id } };
}

function updateBanner(b) {
  const sheet = getSheet('Banners');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  const r = found.row;
  if (b.image !== undefined) sheet.getRange(r, 2).setValue(b.image);
  if (b.link !== undefined) sheet.getRange(r, 3).setValue(b.link);
  if (b.productId !== undefined) sheet.getRange(r, 4).setValue(b.productId);
  if (b.isActive !== undefined) sheet.getRange(r, 5).setValue(b.isActive);
  if (b.order !== undefined) sheet.getRange(r, 6).setValue(b.order);
  logActivity({ userId: 'admin', action: 'updateBanner', details: b.id });
  return { success: true };
}

function deleteBanner(b) {
  const sheet = getSheet('Banners');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.deleteRow(found.row);
  logActivity({ userId: 'admin', action: 'deleteBanner', details: b.id });
  return { success: true };
}

// ============ FAVORITES ============
function getFavorites(b) {
  const sheet = getSheet('Favorites');
  let favs = rowsToObjects(sheet.getDataRange().getValues());
  favs = favs.filter(f => String(f.userId) === String(b.userId));
  const pSheet = getSheet('Products');
  const products = rowsToObjects(pSheet.getDataRange().getValues());
  favs = favs.map(f => ({ ...f, product: products.find(p => p.id === f.productId) || null }));
  return { success: true, data: favs };
}

function toggleFavorite(b) {
  const sheet = getSheet('Favorites');
  const all = sheet.getDataRange().getValues();
  for (let i = 1; i < all.length; i++) {
    if (String(all[i][1]) === String(b.userId) && all[i][2] === b.productId) {
      sheet.deleteRow(i + 1);
      return { success: true, data: { isFavorite: false } };
    }
  }
  const id = 'F' + Date.now();
  sheet.appendRow([id, b.userId, b.productId, new Date().toISOString()]);
  return { success: true, data: { isFavorite: true } };
}

// ============ DASHBOARD ============
function getDashboard() {
  const pS = getSheet('Products'), oS = getSheet('Orders'), uS = getSheet('Users'), rS = getSheet('Reviews');
  const products = pS.getLastRow() > 1 ? rowsToObjects(pS.getDataRange().getValues()) : [];
  const orders = oS.getLastRow() > 1 ? rowsToObjects(oS.getDataRange().getValues()) : [];
  const users = uS.getLastRow() > 1 ? rowsToObjects(uS.getDataRange().getValues()) : [];
  const reviews = rS.getLastRow() > 1 ? rowsToObjects(rS.getDataRange().getValues()) : [];
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.createdAt && String(o.createdAt).startsWith(today)).length;
  return {
    success: true,
    data: {
      totalProducts: products.length, totalOrders: orders.length, totalUsers: users.length, totalReviews: reviews.length,
      totalRevenue, pendingOrders, todayOrders,
      recentOrders: orders.slice(-5).reverse(),
      lowStock: products.filter(p => Number(p.stock) < 5)
    }
  };
}

// ============ NOTIFICATIONS ============
function getNotifications(b) {
  const sheet = getSheet('Notifications');
  let notifs = rowsToObjects(sheet.getDataRange().getValues());
  if (b.userId) notifs = notifs.filter(n => String(n.userId) === String(b.userId) || n.userId === 'all');
  notifs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return { success: true, data: notifs.slice(0, 50) };
}

function markNotifRead(b) {
  const sheet = getSheet('Notifications');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.getRange(found.row, 5).setValue(true);
  return { success: true };
}

function sendNotification(b) {
  const sheet = getSheet('Notifications');
  const id = 'N' + Date.now();
  sheet.appendRow([id, b.userId || 'all', b.title || '', b.message || '', false, new Date().toISOString()]);
  return { success: true, data: { id } };
}

// ============ PROMO CODES ============
function getPromoCodes() {
  const sheet = getSheet('PromoCodes');
  const codes = rowsToObjects(sheet.getDataRange().getValues());
  return { success: true, data: codes };
}

function addPromoCode(b) {
  const sheet = getSheet('PromoCodes');
  const id = 'PC' + Date.now();
  sheet.appendRow([id, b.code, b.discount || 0, b.type || 'percent', b.maxUses || 100, 0, b.expiresAt || '', true]);
  logActivity({ userId: 'admin', action: 'addPromo', details: b.code });
  return { success: true, data: { id } };
}

function validatePromo(b) {
  const sheet = getSheet('PromoCodes');
  const codes = rowsToObjects(sheet.getDataRange().getValues());
  const code = codes.find(c => c.code === b.code && (c.isActive === true || c.isActive === 'true' || c.isActive === 'TRUE'));
  if (!code) return { success: false, error: 'Promokod topilmadi' };
  if (Number(code.usedCount) >= Number(code.maxUses)) return { success: false, error: 'Promokod ishlatish limiti tugagan' };
  if (code.expiresAt && new Date(code.expiresAt) < new Date()) return { success: false, error: 'Promokod muddati tugagan' };
  return { success: true, data: code };
}

function deletePromoCode(b) {
  const sheet = getSheet('PromoCodes');
  const found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.deleteRow(found.row);
  return { success: true };
}

// ============ SUPPORT CHAT ============
function getSupportMessages(b) {
  const sheet = getSheet('SupportMessages');
  let msgs = rowsToObjects(sheet.getDataRange().getValues());
  if (b.userId) msgs = msgs.filter(m => String(m.userId) === String(b.userId));
  msgs.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  return { success: true, data: msgs };
}

function sendSupportMessage(b) {
  const sheet = getSheet('SupportMessages');
  const id = 'SM' + Date.now();
  sheet.appendRow([id, b.userId, b.userName || '', b.message || '', false, new Date().toISOString(), false]);
  return { success: true, data: { id } };
}

function replySupport(b) {
  const sheet = getSheet('SupportMessages');
  const id = 'SM' + Date.now();
  sheet.appendRow([id, b.userId, 'Admin', b.message || '', true, new Date().toISOString(), false]);
  sendNotification({ userId: b.userId, title: 'Support javob', message: b.message });
  return { success: true };
}

// ============ SETTINGS ============
function getSettings() {
  const sheet = getSheet('Settings');
  const data = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < data.length; i++) settings[data[i][0]] = data[i][1];
  return { success: true, data: settings };
}

function updateSetting(b) {
  const sheet = getSheet('Settings');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === b.key) { sheet.getRange(i + 1, 2).setValue(b.value); return { success: true }; }
  }
  sheet.appendRow([b.key, b.value]);
  return { success: true };
}

// ============ ACTIVITY LOG ============
function getActivityLog(b) {
  const sheet = getSheet('ActivityLog');
  let logs = rowsToObjects(sheet.getDataRange().getValues());
  logs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return { success: true, data: logs.slice(0, 100) };
}

function logActivity(b) {
  try {
    const sheet = getSheet('ActivityLog');
    const id = 'L' + Date.now();
    sheet.appendRow([id, b.userId || '', b.action || '', b.details || '', new Date().toISOString()]);
  } catch (e) { }
}

// ============ IMAGE UPLOAD ============
function uploadImage(b) {
  if (!b.imageData) return { success: false, error: 'No image data' };
  try {
    const response = UrlFetchApp.fetch('https://api.imgbb.com/1/upload?key=' + IMGBB_API_KEY, {
      method: 'post', payload: { image: b.imageData }, muteHttpExceptions: true
    });
    const result = JSON.parse(response.getContentText());
    if (result.success) return { success: true, data: { url: result.data.url, display_url: result.data.display_url } };
    return { success: false, error: 'Upload failed: ' + JSON.stringify(result) };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
