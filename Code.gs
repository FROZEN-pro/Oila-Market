// ============================================
// OILA MARKET - GOOGLE APPS SCRIPT BACKEND v3
// ============================================
const SPREADSHEET_ID = '1f7C7a5Piw_2rQIMvxcqppnq6M3iofH1aZCUI_ANoMx0';
const IMGBB_API_KEY = 'ad433e82aae872eebbb30c5bfe3fac42';

// ===== SHEET HELPERS =====
function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) { sheet = ss.insertSheet(name); initSheet(sheet, name); }
  return sheet;
}

function initSheet(sheet, name) {
  const H = {
    'Products': ['id','name','category','price','oldPrice','image','images','description','stock','unit','rating','sold','createdAt','isActive'],
    'Categories': ['id','name','icon','image','isActive','order'],
    'Users': ['id','telegramId','username','name','phone','address','avatar','role','createdAt','lastLogin','isActive'],
    'Orders': ['id','userId','userName','items','total','status','address','phone','note','deliveryType','promoCode','createdAt','updatedAt','deliveredAt'],
    'Cart': ['id','userId','productId','quantity','addedAt'],
    'Reviews': ['id','productId','userId','userName','rating','comment','createdAt','isApproved'],
    'Banners': ['id','image','link','productId','isActive','order','createdAt'],
    'PromoCodes': ['id','code','discount','type','maxUses','usedCount','expiresAt','isActive'],
    'Settings': ['key','value'],
    'Notifications': ['id','userId','title','message','isRead','createdAt'],
    'Favorites': ['id','userId','productId','addedAt'],
    'ActivityLog': ['id','userId','action','details','createdAt'],
    'SupportMessages': ['id','userId','userName','message','image','isAdmin','createdAt','isRead']
  };
  if (H[name]) {
    sheet.getRange(1, 1, 1, H[name].length).setValues([H[name]]);
    sheet.getRange(1, 1, 1, H[name].length).setFontWeight('bold').setBackground('#6C63FF').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
}

// Rebuild all sheets (use from Script Editor to fix sheets)
function initAllSheets() {
  const names = ['Products','Categories','Users','Orders','Cart','Reviews','Banners','PromoCodes','Settings','Notifications','Favorites','ActivityLog','SupportMessages'];
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  names.forEach(function(n) {
    let s = ss.getSheetByName(n);
    if (!s) { s = ss.insertSheet(n); }
    // Clear and re-init headers
    s.clear();
    initSheet(s, n);
  });
  return 'All sheets initialized!';
}

function toJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function rowsToObjects(data) {
  if (!data || data.length <= 1) return [];
  const h = data[0], r = [];
  for (let i = 1; i < data.length; i++) {
    const o = {};
    for (let j = 0; j < h.length; j++) {
      let v = data[i][j];
      // Normalize booleans from Sheets
      if (v === 'TRUE' || v === 'true') v = true;
      if (v === 'FALSE' || v === 'false') v = false;
      o[h[j]] = v;
    }
    r.push(o);
  }
  return r;
}

function findRow(sheet, col, val) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][col]) === String(val)) return { row: i + 1, data: data[i], index: i };
  }
  return null;
}

function isTrue(v) { return v === true || v === 'true' || v === 'TRUE' || v === true; }

// ===== ROUTING =====
function doGet(e) {
  try {
    const p = e.parameter || {};
    return toJson(route(p.action || '', p));
  } catch (err) {
    return toJson({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const body = e.postData ? JSON.parse(e.postData.contents) : (e.parameter || {});
    return toJson(route(body.action || '', body));
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
    case 'getSupportUsers': return getSupportUsers();
    case 'markSupportRead': return markSupportRead(b);
    case 'initSheets': return { success: true, data: initAllSheets() };
    default: return { success: false, error: 'Unknown: ' + action };
  }
}

// ===== PRODUCTS =====
// Products columns: 0:id,1:name,2:category,3:price,4:oldPrice,5:image,6:images,7:description,8:stock,9:unit,10:rating,11:sold,12:createdAt,13:isActive
function getProducts(p) {
  const sheet = getSheet('Products');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  let products = rowsToObjects(sheet.getDataRange().getValues());
  if (p.category && p.category !== 'all') products = products.filter(function(x) { return x.category === p.category; });
  if (p.activeOnly === 'true' || p.activeOnly === true) products = products.filter(function(x) { return isTrue(x.isActive); });
  products.sort(function(a, b) { return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); });
  return { success: true, data: products };
}

function getProduct(b) {
  const sheet = getSheet('Products');
  const products = rowsToObjects(sheet.getDataRange().getValues());
  var p = products.find(function(x) { return x.id === b.id; });
  return p ? { success: true, data: p } : { success: false, error: 'Not found' };
}

function addProduct(b) {
  var sheet = getSheet('Products');
  var id = 'P' + Date.now();
  sheet.appendRow([id, b.name||'', b.category||'', b.price||0, b.oldPrice||'', b.image||'', b.images||'', b.description||'', b.stock||0, b.unit||'dona', 0, 0, new Date().toISOString(), true]);
  logActivity({ userId: 'admin', action: 'addProduct', details: b.name });
  return { success: true, data: { id: id } };
}

function updateProduct(b) {
  var sheet = getSheet('Products');
  var found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  var r = found.row;
  var map = { name:2, category:3, price:4, oldPrice:5, image:6, images:7, description:8, stock:9, unit:10, isActive:14 };
  for (var key in map) {
    if (b[key] !== undefined) sheet.getRange(r, map[key]).setValue(b[key]);
  }
  logActivity({ userId: 'admin', action: 'updateProduct', details: b.id });
  return { success: true };
}

function deleteProduct(b) {
  var sheet = getSheet('Products');
  var found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.deleteRow(found.row);
  logActivity({ userId: 'admin', action: 'deleteProduct', details: b.id });
  return { success: true };
}

// ===== CATEGORIES =====
function getCategories() {
  var sheet = getSheet('Categories');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  var cats = rowsToObjects(sheet.getDataRange().getValues());
  cats.sort(function(a, b) { return (Number(a.order)||0) - (Number(b.order)||0); });
  return { success: true, data: cats };
}

function addCategory(b) {
  var id = 'C' + Date.now();
  getSheet('Categories').appendRow([id, b.name, b.icon||'📦', b.image||'', true, b.order||0]);
  logActivity({ userId: 'admin', action: 'addCategory', details: b.name });
  return { success: true, data: { id: id } };
}

function updateCategory(b) {
  var sheet = getSheet('Categories');
  var found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  var r = found.row;
  if (b.name !== undefined) sheet.getRange(r, 2).setValue(b.name);
  if (b.icon !== undefined) sheet.getRange(r, 3).setValue(b.icon);
  if (b.image !== undefined) sheet.getRange(r, 4).setValue(b.image);
  if (b.isActive !== undefined) sheet.getRange(r, 5).setValue(b.isActive);
  if (b.order !== undefined) sheet.getRange(r, 6).setValue(b.order);
  return { success: true };
}

function deleteCategory(b) {
  var sheet = getSheet('Categories');
  var found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.deleteRow(found.row);
  return { success: true };
}

// ===== USERS =====
// Users cols: 0:id,1:telegramId,2:username,3:name,4:phone,5:address,6:avatar,7:role,8:createdAt,9:lastLogin,10:isActive
function loginUser(b) {
  var sheet = getSheet('Users');
  var all = rowsToObjects(sheet.getDataRange().getValues());
  var tid = String(b.telegramId || '');
  var user = all.find(function(u) { return String(u.telegramId) === tid; });
  if (!user) {
    var id = 'U' + Date.now();
    var now = new Date().toISOString();
    sheet.appendRow([id, tid, b.username||'', b.name||'User', '', '', b.avatar||'', 'user', now, now, true]);
    user = { id:id, telegramId:tid, username:b.username||'', name:b.name||'User', phone:'', address:'', avatar:b.avatar||'', role:'user', isActive:true };
    logActivity({ userId:id, action:'register', details:b.name||'New user' });
  } else {
    var found = findRow(sheet, 1, tid);
    if (found) {
      sheet.getRange(found.row, 10).setValue(new Date().toISOString());
      // Only update Telegram-provided fields (name, username, avatar) - never user-editable fields
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
  var all = rowsToObjects(getSheet('Users').getDataRange().getValues());
  var u = all.find(function(x) { return x.id === b.id || String(x.telegramId) === String(b.telegramId); });
  return u ? { success: true, data: u } : { success: false, error: 'Not found' };
}

// Only phone and address can be edited by user
function updateProfile(b) {
  var sheet = getSheet('Users');
  var all = sheet.getDataRange().getValues();
  for (var i = 1; i < all.length; i++) {
    if (all[i][0] === b.id || String(all[i][1]) === String(b.telegramId)) {
      if (b.phone !== undefined) sheet.getRange(i+1, 5).setValue(b.phone);
      if (b.address !== undefined) sheet.getRange(i+1, 6).setValue(b.address);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

function getUsers() {
  var sheet = getSheet('Users');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  return { success: true, data: rowsToObjects(sheet.getDataRange().getValues()) };
}

function toggleUserStatus(b) {
  var sheet = getSheet('Users');
  var found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  var cur = found.data[10];
  sheet.getRange(found.row, 11).setValue(!isTrue(cur));
  logActivity({ userId:'admin', action:'toggleUser', details:b.id });
  return { success: true };
}

// ===== CART =====
function getCart(b) {
  var sheet = getSheet('Cart');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  var items = rowsToObjects(sheet.getDataRange().getValues()).filter(function(c) { return String(c.userId) === String(b.userId); });
  var products = rowsToObjects(getSheet('Products').getDataRange().getValues());
  items = items.map(function(item) {
    return { id:item.id, productId:item.productId, quantity:item.quantity, product: products.find(function(p) { return p.id === item.productId; }) || null };
  });
  return { success: true, data: items };
}

function addToCart(b) {
  var sheet = getSheet('Cart');
  var all = rowsToObjects(sheet.getDataRange().getValues());
  var ex = all.find(function(c) { return String(c.userId) === String(b.userId) && c.productId === b.productId; });
  if (ex) {
    var found = findRow(sheet, 0, ex.id);
    if (found) { sheet.getRange(found.row, 4).setValue(Number(ex.quantity) + Number(b.quantity||1)); return { success: true }; }
  }
  sheet.appendRow(['CI'+Date.now(), b.userId, b.productId, b.quantity||1, new Date().toISOString()]);
  return { success: true };
}

function updateCartItem(b) {
  var found = findRow(getSheet('Cart'), 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  getSheet('Cart').getRange(found.row, 4).setValue(Number(b.quantity));
  return { success: true };
}

function removeFromCart(b) {
  var sheet = getSheet('Cart');
  var found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.deleteRow(found.row);
  return { success: true };
}

function clearCart(b) {
  var sheet = getSheet('Cart');
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][1]) === String(b.userId)) sheet.deleteRow(i + 1);
  }
  return { success: true };
}

// ===== ORDERS =====
// Orders cols: 0:id,1:userId,2:userName,3:items,4:total,5:status,6:address,7:phone,8:note,9:deliveryType,10:promoCode,11:createdAt,12:updatedAt,13:deliveredAt
function createOrder(b) {
  var sheet = getSheet('Orders');
  var id = 'O' + Date.now();
  var itemsStr = typeof b.items === 'string' ? b.items : JSON.stringify(b.items || []);
  var now = new Date().toISOString();
  sheet.appendRow([id, b.userId, b.userName||'', itemsStr, b.total||0, 'pending', b.address||'', b.phone||'', b.note||'', b.deliveryType||'delivery', b.promoCode||'', now, now, '']);
  // Update sold/stock
  var items = b.items;
  if (typeof items === 'string') { try { items = JSON.parse(items); } catch(e) { items = []; } }
  if (Array.isArray(items)) {
    var pSheet = getSheet('Products');
    items.forEach(function(item) {
      var found = findRow(pSheet, 0, item.productId || item.id);
      if (found) {
        pSheet.getRange(found.row, 12).setValue((Number(found.data[11])||0) + Number(item.qty||item.quantity||1));
        pSheet.getRange(found.row, 9).setValue(Math.max(0, (Number(found.data[8])||0) - Number(item.qty||item.quantity||1)));
      }
    });
  }
  if (b.promoCode) {
    var pS = getSheet('PromoCodes');
    var found = findRow(pS, 1, b.promoCode);
    if (found) pS.getRange(found.row, 7).setValue((Number(found.data[6])||0) + 1);
  }
  clearCart({ userId: b.userId });
  sendNotification({ userId: b.userId, title: 'Buyurtma qabul qilindi! ✅', message: 'Buyurtmangiz #' + id.slice(-6) + ' qabul qilindi!' });
  logActivity({ userId: b.userId, action: 'createOrder', details: id });
  return { success: true, data: { id: id } };
}

function getOrders(b) {
  var sheet = getSheet('Orders');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  var orders = rowsToObjects(sheet.getDataRange().getValues());
  if (b.status && b.status !== 'all') orders = orders.filter(function(o) { return o.status === b.status; });
  orders.sort(function(a, b) { return new Date(b.createdAt||0) - new Date(a.createdAt||0); });
  return { success: true, data: orders };
}

function getUserOrders(b) {
  var sheet = getSheet('Orders');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  var orders = rowsToObjects(sheet.getDataRange().getValues()).filter(function(o) { return String(o.userId) === String(b.userId); });
  orders.sort(function(a, b) { return new Date(b.createdAt||0) - new Date(a.createdAt||0); });
  return { success: true, data: orders };
}

function updateOrderStatus(b) {
  var sheet = getSheet('Orders');
  var found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.getRange(found.row, 6).setValue(b.status);
  sheet.getRange(found.row, 13).setValue(new Date().toISOString());
  if (b.status === 'delivered') sheet.getRange(found.row, 14).setValue(new Date().toISOString());
  var st = { pending:'Kutilmoqda', confirmed:'Tasdiqlandi ✅', shipping:'Yetkazilmoqda 🚚', delivered:'Yetkazildi ✅', cancelled:'Bekor ❌' };
  sendNotification({ userId: found.data[1], title: 'Buyurtma #' + b.id.slice(-6), message: st[b.status] || b.status });
  logActivity({ userId:'admin', action:'updateOrder', details: b.id + '→' + b.status });
  return { success: true };
}

function deleteOrder(b) {
  var sheet = getSheet('Orders');
  var found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.deleteRow(found.row);
  return { success: true };
}

// ===== REVIEWS =====
function addReview(b) {
  var id = 'R' + Date.now();
  getSheet('Reviews').appendRow([id, b.productId, b.userId, b.userName||'', b.rating||5, b.comment||'', new Date().toISOString(), false]);
  recalcRating(b.productId);
  return { success: true, data: { id: id } };
}

function recalcRating(pid) {
  var rS = getSheet('Reviews');
  var revs = rowsToObjects(rS.getDataRange().getValues()).filter(function(r) { return r.productId === pid && isTrue(r.isApproved); });
  var avg = 0;
  if (revs.length > 0) { var s = 0; revs.forEach(function(r) { s += Number(r.rating||0); }); avg = Math.round(s / revs.length * 10) / 10; }
  var pS = getSheet('Products');
  var found = findRow(pS, 0, pid);
  if (found) pS.getRange(found.row, 11).setValue(avg);
}

function getReviews(b) {
  var sheet = getSheet('Reviews');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  var revs = rowsToObjects(sheet.getDataRange().getValues());
  if (b.productId) revs = revs.filter(function(r) { return r.productId === b.productId; });
  if (b.approvedOnly === 'true' || b.approvedOnly === true) revs = revs.filter(function(r) { return isTrue(r.isApproved); });
  revs.sort(function(a, b) { return new Date(b.createdAt||0) - new Date(a.createdAt||0); });
  return { success: true, data: revs };
}

function approveReview(b) {
  var sheet = getSheet('Reviews');
  var found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  sheet.getRange(found.row, 8).setValue(true);
  recalcRating(found.data[1]);
  return { success: true };
}

function deleteReview(b) {
  var sheet = getSheet('Reviews');
  var found = findRow(sheet, 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  var pid = found.data[1];
  sheet.deleteRow(found.row);
  recalcRating(pid);
  return { success: true };
}

// ===== BANNERS =====
function getBanners() {
  var sheet = getSheet('Banners');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  var bs = rowsToObjects(sheet.getDataRange().getValues()).filter(function(b) { return isTrue(b.isActive); });
  bs.sort(function(a, b) { return (Number(a.order)||0) - (Number(b.order)||0); });
  return { success: true, data: bs };
}

function addBanner(b) {
  getSheet('Banners').appendRow(['B'+Date.now(), b.image||'', b.link||'', b.productId||'', true, b.order||0, new Date().toISOString()]);
  return { success: true };
}

function updateBanner(b) {
  var found = findRow(getSheet('Banners'), 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  var r = found.row, s = getSheet('Banners');
  if (b.image !== undefined) s.getRange(r, 2).setValue(b.image);
  if (b.link !== undefined) s.getRange(r, 3).setValue(b.link);
  if (b.productId !== undefined) s.getRange(r, 4).setValue(b.productId);
  if (b.isActive !== undefined) s.getRange(r, 5).setValue(b.isActive);
  if (b.order !== undefined) s.getRange(r, 6).setValue(b.order);
  return { success: true };
}

function deleteBanner(b) {
  var found = findRow(getSheet('Banners'), 0, b.id);
  if (!found) return { success: false, error: 'Not found' };
  getSheet('Banners').deleteRow(found.row);
  return { success: true };
}

// ===== FAVORITES =====
function getFavorites(b) {
  var sheet = getSheet('Favorites');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  var favs = rowsToObjects(sheet.getDataRange().getValues()).filter(function(f) { return String(f.userId) === String(b.userId); });
  var products = rowsToObjects(getSheet('Products').getDataRange().getValues());
  favs = favs.map(function(f) { return { id:f.id, productId:f.productId, product: products.find(function(p) { return p.id === f.productId; }) || null }; });
  return { success: true, data: favs };
}

function toggleFavorite(b) {
  var sheet = getSheet('Favorites');
  var all = sheet.getDataRange().getValues();
  for (var i = 1; i < all.length; i++) {
    if (String(all[i][1]) === String(b.userId) && all[i][2] === b.productId) {
      sheet.deleteRow(i + 1);
      return { success: true, data: { isFavorite: false } };
    }
  }
  sheet.appendRow(['F'+Date.now(), b.userId, b.productId, new Date().toISOString()]);
  return { success: true, data: { isFavorite: true } };
}

// ===== DASHBOARD =====
function getDashboard() {
  var pS = getSheet('Products'), oS = getSheet('Orders'), uS = getSheet('Users'), rS = getSheet('Reviews');
  var products = pS.getLastRow() > 1 ? rowsToObjects(pS.getDataRange().getValues()) : [];
  var orders = oS.getLastRow() > 1 ? rowsToObjects(oS.getDataRange().getValues()) : [];
  var users = uS.getLastRow() > 1 ? rowsToObjects(uS.getDataRange().getValues()) : [];
  var reviews = rS.getLastRow() > 1 ? rowsToObjects(rS.getDataRange().getValues()) : [];
  var revenue = 0; orders.forEach(function(o) { if (o.status === 'delivered') revenue += Number(o.total||0); });
  var pending = orders.filter(function(o) { return o.status === 'pending'; }).length;
  var today = new Date().toISOString().split('T')[0];
  var todayO = orders.filter(function(o) { return o.createdAt && String(o.createdAt).indexOf(today) === 0; }).length;
  return { success: true, data: { totalProducts: products.length, totalOrders: orders.length, totalUsers: users.length, totalReviews: reviews.length, totalRevenue: revenue, pendingOrders: pending, todayOrders: todayO, recentOrders: orders.slice(-5).reverse(), lowStock: products.filter(function(p) { return Number(p.stock) < 5; }) } };
}

// ===== NOTIFICATIONS =====
function getNotifications(b) {
  var sheet = getSheet('Notifications');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  var n = rowsToObjects(sheet.getDataRange().getValues());
  if (b.userId) n = n.filter(function(x) { return String(x.userId) === String(b.userId) || x.userId === 'all'; });
  n.sort(function(a, b) { return new Date(b.createdAt||0) - new Date(a.createdAt||0); });
  return { success: true, data: n.slice(0, 50) };
}

function markNotifRead(b) {
  var found = findRow(getSheet('Notifications'), 0, b.id);
  if (!found) return { success: false };
  getSheet('Notifications').getRange(found.row, 5).setValue(true);
  return { success: true };
}

function sendNotification(b) {
  getSheet('Notifications').appendRow(['N'+Date.now(), b.userId||'all', b.title||'', b.message||'', false, new Date().toISOString()]);
  return { success: true };
}

// ===== PROMO CODES =====
function getPromoCodes() {
  var sheet = getSheet('PromoCodes');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  return { success: true, data: rowsToObjects(sheet.getDataRange().getValues()) };
}

function addPromoCode(b) {
  getSheet('PromoCodes').appendRow(['PC'+Date.now(), b.code, b.discount||0, b.type||'percent', b.maxUses||100, 0, b.expiresAt||'', true]);
  return { success: true };
}

function validatePromo(b) {
  var codes = rowsToObjects(getSheet('PromoCodes').getDataRange().getValues());
  var c = codes.find(function(x) { return x.code === b.code && isTrue(x.isActive); });
  if (!c) return { success: false, error: 'Promokod topilmadi' };
  if (Number(c.usedCount) >= Number(c.maxUses)) return { success: false, error: 'Limit tugagan' };
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { success: false, error: 'Muddati tugagan' };
  return { success: true, data: c };
}

function deletePromoCode(b) {
  var found = findRow(getSheet('PromoCodes'), 0, b.id);
  if (!found) return { success: false };
  getSheet('PromoCodes').deleteRow(found.row);
  return { success: true };
}

// ===== SUPPORT CHAT =====
function getSupportMessages(b) {
  var sheet = getSheet('SupportMessages');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  var msgs = rowsToObjects(sheet.getDataRange().getValues());
  if (b.userId) msgs = msgs.filter(function(m) { return String(m.userId) === String(b.userId); });
  msgs.sort(function(a, b) { return new Date(a.createdAt||0) - new Date(b.createdAt||0); });
  return { success: true, data: msgs };
}

function sendSupportMessage(b) {
  getSheet('SupportMessages').appendRow(['SM'+Date.now(), b.userId, b.userName||'', b.message||'', b.image||'', false, new Date().toISOString(), false]);
  return { success: true };
}

function replySupport(b) {
  getSheet('SupportMessages').appendRow(['SM'+Date.now(), b.userId, 'Admin', b.message||'', b.image||'', true, new Date().toISOString(), false]);
  sendNotification({ userId: b.userId, title: '💬 Support javob', message: b.message || 'Rasm yuborildi' });
  return { success: true };
}

function getSupportUsers() {
  var sheet = getSheet('SupportMessages');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  var msgs = rowsToObjects(sheet.getDataRange().getValues());
  var userMap = {};
  msgs.forEach(function(m) {
    var uid = String(m.userId);
    if (!userMap[uid]) userMap[uid] = { userId: uid, userName: m.userName || 'User', unread: 0, lastMessage: '', lastImage: '', lastAt: '' };
    if (!isTrue(m.isAdmin) && !isTrue(m.isRead)) userMap[uid].unread++;
    var mTime = new Date(m.createdAt || 0).getTime();
    var curTime = userMap[uid].lastAt ? new Date(userMap[uid].lastAt).getTime() : 0;
    if (mTime >= curTime) {
      userMap[uid].lastMessage = m.message || '';
      userMap[uid].lastImage = m.image || '';
      userMap[uid].lastAt = m.createdAt;
    }
  });
  var result = Object.values(userMap);
  result.sort(function(a, b) { return new Date(b.lastAt || 0) - new Date(a.lastAt || 0); });
  return { success: true, data: result };
}

function markSupportRead(b) {
  var sheet = getSheet('SupportMessages');
  if (sheet.getLastRow() <= 1) return { success: true };
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(b.userId) && !isTrue(data[i][7])) {
      sheet.getRange(i + 1, 8).setValue(true);
    }
  }
  return { success: true };
}

// ===== SETTINGS =====
function getSettings() {
  var sheet = getSheet('Settings');
  if (sheet.getLastRow() <= 1) return { success: true, data: {} };
  var data = sheet.getDataRange().getValues(), s = {};
  for (var i = 1; i < data.length; i++) s[data[i][0]] = data[i][1];
  return { success: true, data: s };
}

function updateSetting(b) {
  var sheet = getSheet('Settings');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === b.key) { sheet.getRange(i+1, 2).setValue(b.value); return { success: true }; }
  }
  sheet.appendRow([b.key, b.value]);
  return { success: true };
}

// ===== ACTIVITY LOG =====
function getActivityLog() {
  var sheet = getSheet('ActivityLog');
  if (sheet.getLastRow() <= 1) return { success: true, data: [] };
  var logs = rowsToObjects(sheet.getDataRange().getValues());
  logs.sort(function(a, b) { return new Date(b.createdAt||0) - new Date(a.createdAt||0); });
  return { success: true, data: logs.slice(0, 100) };
}

function logActivity(b) {
  try { getSheet('ActivityLog').appendRow(['L'+Date.now(), b.userId||'', b.action||'', b.details||'', new Date().toISOString()]); } catch(e) {}
}

// ===== IMAGE UPLOAD =====
function uploadImage(b) {
  if (!b.imageData) return { success: false, error: 'No data' };
  try {
    var r = UrlFetchApp.fetch('https://api.imgbb.com/1/upload?key=' + IMGBB_API_KEY, { method: 'post', payload: { image: b.imageData }, muteHttpExceptions: true });
    var res = JSON.parse(r.getContentText());
    if (res.success) return { success: true, data: { url: res.data.url } };
    return { success: false, error: 'Upload failed' };
  } catch(e) { return { success: false, error: e.toString() }; }
}
