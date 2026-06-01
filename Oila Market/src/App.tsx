import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Home, Search, ShoppingCart, Package, User } from 'lucide-react';
import { useStore } from './store';
import { saveUser } from './api';
import { HomeTab } from './components/user/HomeTab';
import { SearchTab } from './components/user/SearchTab';
import { CartTab } from './components/user/CartTab';
import { OrdersTab } from './components/user/OrdersTab';
import { ProfileTab } from './components/user/ProfileTab';
import { AdminApp } from './components/admin/AdminApp';
import { GuideView } from './components/GuideView';
import type { User as UserType } from './types';

// Detect if it's Admin via URL or Telegram user ID
const ADMIN_IDS = [858310974]; // Replace with real admin Telegram IDs
const isAdminUrl = () => typeof window !== 'undefined' && (
  window.location.href.includes('admin') ||
  window.location.search.includes('admin=1') ||
  localStorage.getItem('oila_admin') === 'true'
);

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            language_code?: string;
          };
        };
        MainButton?: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
        };
        colorScheme?: 'dark' | 'light';
        themeParams?: {
          bg_color?: string;
        };
      };
    };
  }
}

const UserApp: React.FC = () => {
  const { activeTab, setActiveTab, darkMode, cartCount } = useStore();
  const count = cartCount();

  const tabs = [
    { key: 'home', icon: Home, label: 'Asosiy' },
    { key: 'search', icon: Search, label: 'Qidiruv' },
    { key: 'cart', icon: ShoppingCart, label: 'Savat', badge: count },
    { key: 'orders', icon: Package, label: 'Buyurtmalar' },
    { key: 'profile', icon: User, label: 'Profil' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeTab />;
      case 'search': return <SearchTab />;
      case 'cart': return <CartTab />;
      case 'orders': return <OrdersTab />;
      case 'profile': return <ProfileTab />;
      default: return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-['Inter',sans-serif] max-w-md mx-auto relative">
      {/* Page Content */}
      {renderContent()}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl">
        <div className="flex items-center justify-around px-1 py-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative ${activeTab === tab.key ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <div className={`relative w-10 h-7 flex items-center justify-center rounded-xl transition-all duration-200 ${activeTab === tab.key ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                <tab.icon
                  size={19}
                  className={`transition-all duration-200 ${activeTab === tab.key ? 'scale-110' : ''}`}
                  strokeWidth={activeTab === tab.key ? 2.5 : 1.8}
                />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-all ${activeTab === tab.key ? 'opacity-100' : 'opacity-60'}`}>{tab.label}</span>
              {activeTab === tab.key && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { setCurrentUser, setIsAdmin, isAdmin, darkMode } = useStore();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      // Initialize Telegram Web App
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
      }

      // Get Telegram user
      const tgUser = tg?.initDataUnsafe?.user;

      // Check if admin
      const adminMode = isAdminUrl();
      const isTgAdmin = tgUser ? ADMIN_IDS.includes(tgUser.id) : false;

      if (adminMode || isTgAdmin) {
        setIsAdmin(true);
        if (tgUser) {
          const user: UserType = {
            id: String(tgUser.id),
            telegramId: tgUser.id,
            name: `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`,
            username: tgUser.username,
            photo: tgUser.photo_url,
            totalOrders: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(user);
        }
      } else {
        // Regular user flow
        if (tgUser) {
          const user: UserType = {
            id: String(tgUser.id),
            telegramId: tgUser.id,
            name: `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`,
            username: tgUser.username,
            photo: tgUser.photo_url,
            totalOrders: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(user);
          // Save/update user in backend
          await saveUser(user);
        } else {
          // Demo user for non-Telegram environment
          const demoUser: UserType = {
            id: 'demo-1',
            telegramId: 0,
            name: 'Demo Foydalanuvchi',
            username: 'demo_user',
            photo: '',
            totalOrders: 5,
            totalSpent: 250000,
            address: 'Toshkent, Chilonzor',
            addresses: [],
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(demoUser);
        }
      }
    } catch (err) {
      console.error('Init error:', err);
    }
    setInitialized(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 ${darkMode ? 'dark' : ''}`}>
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto shadow-2xl">
            <span className="text-4xl">🏪</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Oila Market</h1>
          <p className="text-white/70 text-sm mb-8">Yuklanmoqda...</p>
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isGuideMode = typeof window !== 'undefined' && window.location.search.includes('guide=1');

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: darkMode ? '#1f2937' : '#fff',
            color: darkMode ? '#fff' : '#1f2937',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
      <div className={darkMode ? 'dark' : ''}>
        {isGuideMode ? <GuideView /> : isAdmin ? <AdminApp /> : <UserApp />}
      </div>
    </>
  );
};

export default App;
