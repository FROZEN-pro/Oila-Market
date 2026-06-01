import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Copy, Check } from 'lucide-react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-4 text-left">
        <span className="font-bold text-gray-900 dark:text-white">{title}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800">{children}</div>}
    </div>
  );
};

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative mt-3 bg-gray-900 dark:bg-gray-950 rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto">
      <button onClick={copy} className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600">
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
      <pre className="whitespace-pre-wrap">{code}</pre>
    </div>
  );
};

export const GuideView: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 pt-6 pb-12">
        <h1 className="text-2xl font-black text-white mb-1">📖 O'rnatish Qo'llanmasi</h1>
        <p className="text-white/70 text-sm">Oila Market v2.0 - To'liq sozlash</p>
      </div>

      <div className="px-4 -mt-6 space-y-3">
        {/* Step 1 */}
        <Section title="1️⃣ Google Sheets & Apps Script" defaultOpen={true}>
          <div className="space-y-3 pt-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">📋 Qadamlar:</p>
              <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-decimal list-inside">
                <li>sheets.google.com'da yangi spreadsheet yarating</li>
                <li>URL'dan Spreadsheet ID'ni oling</li>
                <li>Kengaytmalar → Apps Script oching</li>
                <li>APPS_SCRIPT_BACKEND.gs kodini joylang</li>
                <li>Deploy → New deployment → Web app</li>
                <li>setupSpreadsheet() funksiyasini ishga tushiring</li>
              </ol>
            </div>
            <CodeBlock code={`const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const ADMIN_TELEGRAM_IDS = [123456789];
const TELEGRAM_BOT_TOKEN_USER = 'BOT_TOKEN';
const TELEGRAM_BOT_TOKEN_ADMIN = 'ADMIN_BOT_TOKEN';`} />
          </div>
        </Section>

        {/* Step 2 */}
        <Section title="2️⃣ Telegram Botlar yaratish">
          <div className="space-y-3 pt-3">
            <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-3 py-2 rounded-xl text-sm font-medium">
              <ExternalLink size={14} /> @BotFather'ga o'tish
            </a>
            <CodeBlock code={`/newbot
→ Nom: Oila Market
→ Username: YourMarketBot

/newbot
→ Nom: Oila Market Admin
→ Username: YourMarketAdminBot`} />
            <p className="text-xs text-gray-500 dark:text-gray-400">Har bir bot uchun token saqlang!</p>
          </div>
        </Section>

        {/* Step 3 */}
        <Section title="3️⃣ Bot'ga Web App URL sozlash">
          <div className="space-y-3 pt-3">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                BotFather → /mybots → Bot tanlang → Bot Settings → Menu Button → Set URL
              </p>
            </div>
            <CodeBlock code={`# User Bot URL:
https://your-username.github.io/oila-market/

# Admin Bot URL:
https://your-username.github.io/oila-market/?admin=1`} />
          </div>
        </Section>

        {/* Step 4 */}
        <Section title="4️⃣ GitHub Pages Deploy">
          <div className="space-y-3 pt-3">
            <CodeBlock code={`# 1. Repository yarating: "oila-market"
# 2. src/config.ts'ni yangilang:

export const API_URL = 'YOUR_APPS_SCRIPT_URL';
export const IMGBB_API_KEY = 'YOUR_IMGBB_KEY';

# 3. Build:
npm install
npm run build

# 4. GitHub Pages → Settings → Pages
# Source: GitHub Actions`} />
          </div>
        </Section>

        {/* Step 5 */}
        <Section title="5️⃣ ImgBB API (Rasm yuklash)">
          <div className="space-y-3 pt-3">
            <a href="https://api.imgbb.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 px-3 py-2 rounded-xl text-sm font-medium">
              <ExternalLink size={14} /> imgbb.com'dan API key olish
            </a>
            <CodeBlock code={`# src/config.ts:
export const IMGBB_API_KEY = 'your-api-key-here';`} />
          </div>
        </Section>

        {/* Step 6 */}
        <Section title="6️⃣ Admin ID sozlash">
          <div className="space-y-3 pt-3">
            <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-2 rounded-xl text-sm font-medium">
              <ExternalLink size={14} /> @userinfobot - ID bilish
            </a>
            <CodeBlock code={`# src/App.tsx:
const ADMIN_IDS = [123456789, 987654321];
# (Sizning Telegram ID'laringiz)

# Apps Script:
const ADMIN_TELEGRAM_IDS = [123456789];`} />
          </div>
        </Section>

        {/* Features */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">✨ Xususiyatlar ro'yxati</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              '🌙 Dark Mode', '👤 Profil tahrirlash', '📍 Manzil boshqaruvi', '🔍 Qidiruv', '🛒 Savat', '📦 Buyurtmalar', '⭐ Sharhlar', '🏷️ Promo kodlar', '🎨 Bannerlar', '📊 Statistika', '💬 Xabar yuborish', '🚫 User bloklash', '📱 Telegram notif', '🖼️ ImgBB yuklash', '📂 Kategoriyalar', '⚙️ Sozlamalar',
            ].map((f, i) => (
              <div key={i} className="bg-white/10 rounded-xl px-2 py-1.5 text-white text-xs">{f}</div>
            ))}
          </div>
        </div>

        {/* Files */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">📁 Muhim fayllar</h3>
          <div className="space-y-2">
            {[
              { file: 'src/config.ts', desc: 'API URL va sozlamalar' },
              { file: 'src/App.tsx', desc: 'Admin IDlar va asosiy app' },
              { file: 'public/APPS_SCRIPT_BACKEND.gs', desc: 'Backend kodi (Apps Script)' },
              { file: 'public/SETUP_GUIDE.md', desc: 'To\'liq qo\'llanma' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <span className="text-indigo-500 font-mono text-xs bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg">{item.file}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-xs text-gray-400 dark:text-gray-600">Oila Market v2.0 © 2024</p>
          <p className="text-xs text-gray-400 dark:text-gray-600">Telegram Mini App + Google Sheets + ImgBB</p>
        </div>
      </div>
    </div>
  );
};
