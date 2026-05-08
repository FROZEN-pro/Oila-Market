# 🕌 Muslim Market — To'liq O'rnatish Qo'llanmasi

## 📋 Umumiy ko'rinish

Muslim Market — bu **Telegram Web App** asosida qurilgan online bozor ilovasi. Quyidagi texnologiyalardan foydalanilgan:

- **Frontend:** HTML, CSS, JavaScript (index.html — User, admin.html — Admin)
- **Backend/DB:** Google Sheets + Google Apps Script
- **Bot:** Telegram Bot API
- **Rasm yuklash:** ImgBB API
- **Autentifikatsiya:** Telegram WebApp initData (avtomatik)

---

## 🗂️ Fayl tuzilmasi

```
muslim-market/
├── index.html        ← Foydalanuvchi ilovasi
├── admin.html        ← Admin panel
├── appscript.gs      ← Google Apps Script kodi (Google Sheets backend)
└── README.md         ← Bu fayl
```

---

## 🚀 BOSQICHMA-BOSQICH O'RNATISH

---

### 1-BOSQICH: Telegram Bot yaratish

1. **@BotFather** botiga `/newbot` yozing
2. Bot nomini kiriting: `Muslim Market`
3. Bot username kiriting: `muslim_market_bot` (yoki boshqa)
4. **BOT TOKEN** ni nusxalang (masalan: `7123456789:AAFxxxxxxxxxxxxxxxx`)
5. Web App sozlash uchun:
   ```
   /newapp → botni tanlang → Web App URL ni keyinroq kiriting
   ```

---

### 2-BOSQICH: Google Sheets tayyorlash

#### Google Sheets yaratish

1. [sheets.google.com](https://sheets.google.com) ga kiring
2. **Yangi jadval** yarating
3. Nom bering: `Muslim Market DB`
4. URL dagi spreadsheet ID ni nusxalang:
   ```
   https://docs.google.com/spreadsheets/d/[BU_SPREADSHEET_ID]/edit
   ```

#### Kerakli sheet (varaqlar) nomlari:

Quyidagi nomlar avtomatik yaratiladi, lekin qo'lda ham qo'shsangiz bo'ladi:

| Sheet nomi     | Maqsad                |
|----------------|-----------------------|
| `Products`     | Mahsulotlar ma'lumoti |
| `Categories`   | Kategoriyalar         |
| `Orders`       | Buyurtmalar           |
| `OrderItems`   | Buyurtma tarkibi      |
| `Users`        | Foydalanuvchilar      |
| `Promos`       | Promo kodlar          |
| `Reviews`      | Sharhlar              |
| `Settings`     | Sozlamalar            |
| `BroadcastLog` | Yuborilgan xabarlar   |

---

### 3-BOSQICH: Google Apps Script sozlash

1. Google Sheets da: **Extensions → Apps Script**
2. `appscript.gs` faylidagi barcha kodni nusxalab **Code.gs** ga yapıştırın
3. Fayl yuqorisidagi sozlamalarni o'zgartiring:

```javascript
const SPREADSHEET_ID = 'your_spreadsheet_id_here';
const BOT_TOKEN = 'your_telegram_bot_token';
const ADMIN_IDS = ['your_telegram_id'];  // @userinfobot dan topasiz
const ADMIN_SECRET = 'strong_random_secret_key_2024';
```

#### Apps Script ni deploy qilish:

1. **Deploy → New deployment** bosing
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone** ⚠️ (Muhim!)
5. **Deploy** bosing
6. **Web App URL** ni nusxalang (juda muhim!)
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

#### Boshlang'ich ma'lumotlarni yuklash:

1. Apps Script da `setupInitialData` funksiyasini tanlang
2. ▶ **Run** tugmasini bosing
3. Ruxsat so'rasa → **Review permissions → Allow**
4. Google Sheets da demo ma'lumotlar paydo bo'lishi kerak ✅

---

### 4-BOSQICH: ImgBB API olish (mahsulot rasmlari uchun)

1. [imgbb.com](https://imgbb.com) ga kiring va royxatdan o'ting
2. **Settings → API** bo'limga o'ting
3. API Key ni nusxalang

---

### 5-BOSQICH: GitHub Pages ga yuklash (hosting)

1. [github.com](https://github.com) da yangi **repository** yarating
2. `index.html` va `admin.html` fayllarni yuklang
3. **Settings → Pages → Source: main branch** → Save
4. URL ko'rsatiladi: `https://username.github.io/repo-name/`

---

### 6-BOSQICH: CONFIG sozlamalari

#### `index.html` dagi CONFIG:

```javascript
const CONFIG = {
  SHEET_API_URL: 'https://script.google.com/macros/s/YOUR_ID/exec', // Apps Script URL
  BOT_USERNAME: 'your_bot_username',      // Bot username (@siz)
  IMGBB_API_KEY: 'your_imgbb_api_key',   // ImgBB API key
  SHOP_NAME: 'Muslim Market',
  SHOP_CURRENCY: "so'm",
  SHOP_PHONE: '+998 90 123 45 67',
  SHOP_ADDRESS: 'Toshkent shahar',
  DELIVERY_FEE: 15000,
  FREE_DELIVERY_FROM: 200000,
  CHANNEL_USERNAME: 'your_channel',      // Telegram kanal
  ADMIN_IDS: ['123456789'],              // Admin Telegram ID lari
};
```

#### `admin.html` dagi ADMIN_CONFIG:

```javascript
const ADMIN_CONFIG = {
  SHEET_API_URL: 'https://script.google.com/macros/s/YOUR_ID/exec',
  BOT_TOKEN: 'YOUR_BOT_TOKEN',           // Bot token (admin uchun)
  IMGBB_API_KEY: 'your_imgbb_api_key',
  ADMIN_IDS: ['123456789'],
  ADMIN_SECRET: 'your_admin_secret_key', // Apps Script dagi bilan bir xil
};
```

---

### 7-BOSQICH: Telegram Bot WebApp sozlash

1. **@BotFather** ga boring
2. Bot ni tanlang → **Bot Settings → Menu Button**
3. URL: `https://username.github.io/repo-name/index.html`
4. Yoki `/setmenubutton` buyrug'ini ishlating

#### Webhook o'rnatish (bot buyruqlari uchun):

Apps Script da `setWebhook` funksiyasini ishga tushiring — bu Telegram botdan kelgan xabarlarni qabul qilish uchun kerak.

---

### 8-BOSQICH: Admin Telegram ID topish

1. Telegram da **@userinfobot** botiga yozing
2. U sizning ID raqamingizni ko'rsatadi
3. Bu ID ni `ADMIN_IDS` ga qo'shing

---

## 🔒 Xavfsizlik

- **Admin panel** faqat `ADMIN_IDS` ro'yxatidagi Telegram ID lar uchun ochiq
- **Apps Script** `adminSecret` kalitni tekshiradi
- **Foydalanuvchilar** faqat o'z ma'lumotlarini ko'ra oladi
- **Telegram initData** orqali avtomatik autentifikatsiya

---

## 📊 Google Sheets Ustunlar Tuzilmasi

### Products varag'i:
| Ustun | Ma'no |
|-------|-------|
| id | Mahsulot ID (masalan: p1) |
| name | Mahsulot nomi |
| category | Kategoriya nomi |
| price | Joriy narx (so'm) |
| oldPrice | Eski narx (chegirma ko'rsatish uchun, 0=yo'q) |
| stock | Qoldiq soni |
| unit | O'lchov birligi (kg, dona, litr...) |
| description | Tavsif |
| image | Rasm URL (ImgBB) |
| rating | Reyting (1-5) |
| reviewCount | Sharhlar soni |
| isNew | Yangi mahsulotmi (TRUE/FALSE) |
| isFeatured | Mashhurmi (TRUE/FALSE) |
| status | active/inactive |
| createdAt | Yaratilgan sana |
| updatedAt | O'zgartirilgan sana |

### Orders varag'i:
| Ustun | Ma'no |
|-------|-------|
| id | Buyurtma ID (ORD-xxx) |
| userId | Telegram user ID |
| userName | Foydalanuvchi ismi |
| userUsername | Telegram username |
| subtotal | Mahsulotlar narxi |
| deliveryFee | Yetkazib berish narxi |
| discount | Chegirma summasi |
| total | Jami summa |
| deliveryType | delivery/pickup |
| address | Manzil |
| note | Izoh |
| promoCode | Ishlatilingan promo kod |
| status | new/confirmed/processing/delivering/delivered/cancelled |
| adminNote | Admin izohi |
| date | Buyurtma sanasi |
| updatedAt | O'zgartirilgan sana |

---

## 💡 Telegram Bot buyruqlari

| Buyruq | Funksiya |
|--------|----------|
| `/start` | Ilovani ochish tugmasini ko'rsatish |
| `/admin` | Admin panelni ochish (faqat adminlar) |
| `/stats` | Statistika ko'rish (faqat adminlar) |

---

## 🛠️ Muammolar va yechimlar

### CORS xatosi
Apps Script da deploy qilayotganda "Who has access: **Anyone**" ni tanlang

### Bot webhook ishlamayapti
`setWebhook()` funksiyasini qayta ishlatib ko'ring

### Ma'lumotlar yuklanmayapti
`SHEET_API_URL` ni tekshiring — oxirida `/exec` bo'lishi kerak

### Admin panelga kira olmayapti
Telegram ID ni `ADMIN_IDS` va `ADMIN_SECRET` ni to'g'ri kiritganingizni tekshiring

---

## 📞 Qo'shimcha funksiyalar

- ✅ Telegram orqali avtomatik login
- ✅ Mahsulot qidirish va filtrlash
- ✅ Savat va buyurtma berish
- ✅ Buyurtma holati kuzatuvi
- ✅ Promo kod tizimi
- ✅ Mahsulotlarga sharhlar
- ✅ Sevimlilar ro'yxati
- ✅ Admin: barcha buyurtmalar
- ✅ Admin: mahsulot CRUD
- ✅ Admin: kategoriyalar
- ✅ Admin: promo kodlar
- ✅ Admin: foydalanuvchilar
- ✅ Admin: analitika grafiklar
- ✅ Admin: Telegram broadcast
- ✅ Admin: sharhlar moderatsiyasi
- ✅ ImgBB orqali rasm yuklash
- ✅ CSV export
- ✅ Responsive dizayn (mobile + desktop)
