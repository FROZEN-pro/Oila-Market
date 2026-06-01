# 🏪 Oila Market - To'liq O'rnatish Qo'llanmasi

## 📋 Umumiy ko'rinish

```
Oila Market
├── User App (Telegram Bot → Mini App)
├── Admin App (Alohida Telegram Bot → Mini App)
└── Backend (Google Apps Script + Google Sheets)
```

---

## 🔧 1-QADAM: Google Sheets va Apps Script

### 1.1 Google Sheets yaratish

1. [sheets.google.com](https://sheets.google.com) ga kiring
2. Yangi spreadsheet yarating: **"Oila Market DB"**
3. Spreadsheet ID ni URL'dan oliq:
   ```
   https://docs.google.com/spreadsheets/d/[BU_SPREADSHEET_ID]/edit
   ```
4. Bu IDni saqlang → keyinroq kerak bo'ladi

### 1.2 Apps Script o'rnatish

1. Spreadsheet'da: **Kengaytmalar → Apps Script**
2. `APPS_SCRIPT_BACKEND.gs` faylidagi kodni nusxalab qo'ying
3. **config qismini o'zgartiring:**
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
   const TELEGRAM_BOT_TOKEN_USER = '1234567890:ABCdef...';
   const TELEGRAM_BOT_TOKEN_ADMIN = '0987654321:XYZabc...';
   const ADMIN_TELEGRAM_IDS = [123456789]; // Sizning Telegram ID'ingiz
   ```

4. **Deploy qilish:**
   - `Deploy → New deployment`
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - `Deploy` tugmasini bosing
   - Script URL'ni saqlang!

5. **Spreadsheetni sozlash** - Apps Script'da `setupSpreadsheet` funksiyasini ishga tushiring

---

## 🤖 2-QADAM: Telegram Botlarni yaratish

### 2.1 BotFather orqali bot yaratish

**User Bot:**
```
/start
/newbot
Oila Market    → Bot nomi
OilaMarketBot  → Username (@OilaMarketBot)
```
→ Token saqlang: `1234567890:ABCdef...`

**Admin Bot:**
```
/newbot
Oila Market Admin    → Bot nomi
OilaMarketAdminBot   → Username (@OilaMarketAdminBot)
```
→ Token saqlang: `0987654321:XYZabc...`

### 2.2 Web App URL'ni sozlash

**User Bot uchun:**
```
BotFather → /mybots → @OilaMarketBot
→ Bot Settings → Menu Button → Edit Menu Button URL
→ URL: https://your-username.github.io/oila-market/ 
```

**Admin Bot uchun:**
```
→ URL: https://your-username.github.io/oila-market/?admin=1
```

---

## 🌐 3-QADAM: GitHub Pages ga Deploy qilish

### 3.1 GitHub repository yaratish

```bash
# 1. Yangi repository: "oila-market"
# 2. Public bo'lishi kerak

# Loyihani clone qiling
git clone https://github.com/your-username/oila-market.git
cd oila-market
```

### 3.2 Build va deploy

```bash
# npm packages o'rnatish
npm install

# config.ts'dagi sozlamalarni o'zgartiring:
# API_URL = 'your-apps-script-url'

# Build qilish
npm run build

# dist/ papkasini ko'chiring yoki GitHub Actions ishlatiting
```

### 3.3 GitHub Pages sozlash

```
GitHub Repository → Settings → Pages
Source: GitHub Actions YOKI gh-pages branch
```

**github/workflows/deploy.yml:**
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 🖼️ 4-QADAM: ImgBB API (Rasm yuklash)

1. [imgbb.com](https://imgbb.com) ga kiring va ro'yxatdan o'ting
2. [api.imgbb.com](https://api.imgbb.com) → API key oling
3. `src/config.ts` faylida:
   ```typescript
   export const IMGBB_API_KEY = 'your-imgbb-api-key';
   ```

---

## ⚙️ 5-QADAM: Admin ID sozlash

`src/App.tsx` faylida:
```typescript
const ADMIN_IDS = [123456789, 987654321]; // Admin Telegram IDlari
```

Telegram ID'ni bilish:
- [@userinfobot](https://t.me/userinfobot) ga yozing

---

## 🔗 6-QADAM: URL'larni sozlash

`src/config.ts` faylida barcha URLlarni yangilang:
```typescript
export const API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
export const IMGBB_API_KEY = 'your-imgbb-key';
export const TELEGRAM_CHANNEL = '@your_channel';
export const TELEGRAM_BOT_USER = '@YourUserBot';
export const TELEGRAM_BOT_ADMIN = '@YourAdminBot';
```

---

## 📱 7-QADAM: Ilovani sinab ko'rish

### User App test:
1. Telegram'da @OilaMarketBot ga yozing
2. /start → Mini App tugmasini bosing
3. Mahsulotlarni ko'ring, savatchaga qo'shing, buyurtma bering

### Admin App test:
1. @OilaMarketAdminBot ga yozing
2. /start → Admin panel tugmasini bosing
3. Buyurtmalarni ko'ring va statuslarni o'zgartiring

---

## 🔧 Xatoliklarni tuzatish

### CORS xatosi:
Apps Script'ni qayta deploy qiling (versiyani yangilang)

### Data yuklanmayapti:
Browser console'ni tekshiring, API_URL to'g'ri ekanligiga ishonch hosil qiling

### Bot ishlamayapti:
BotFather'da Web App URL to'g'ri sozlanganligini tekshiring

---

## 📊 Spreadsheet tuzilishi

| Sheet | Ma'lumot |
|-------|---------|
| Products | Barcha mahsulotlar |
| Categories | Kategoriyalar |
| Orders | Buyurtmalar |
| Users | Foydalanuvchilar |
| Reviews | Mahsulot sharhlari |
| Banners | Banner reklamalar |
| PromoCodes | Promo kodlar |
| Settings | Do'kon sozlamalari |
| Messages | Xabarlar tarixi |

---

## 🚀 Qo'shimcha xususiyatlar

### Telegram Webhook sozlash (real-time notifikatsiyalar):
Apps Script'da `setWebhook()` funksiyasini bir marta ishga tushiring

### Do'kon ochish/yopish:
Admin Panel → Sozlamalar → Do'kon holati toggle

### Promo kodlar:
Admin Panel → Sozlamalar → Promo kodlar → Qo'shish

### Bannerlar:
Admin Panel → Sozlamalar → Bannerlar → Yangi banner

---

## 📞 Yordam

Muammo bo'lsa, Telegram orqali bog'laning yoki GitHub Issues'ga muammo qo'ying.

---

**Oila Market v2.0** - Mukammal online do'kon yechimi 🏪
