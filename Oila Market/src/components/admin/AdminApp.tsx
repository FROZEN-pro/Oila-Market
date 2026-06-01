import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, FolderOpen } from 'lucide-react';
import { useStore } from '../../store';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminUsers } from './AdminUsers';
import { AdminSettings } from './AdminSettings';

const tabs = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'orders', icon: ShoppingCart, label: 'Buyurtma' },
  { key: 'products', icon: Package, label: 'Mahsulot' },
  { key: 'categories', icon: FolderOpen, label: 'Kategoriya' },
  { key: 'users', icon: Users, label: 'Userlar' },
  { key: 'settings', icon: Settings, label: 'Sozlama' },
];

export const AdminApp: React.FC = () => {
  const { adminTab, setAdminTab, darkMode } = useStore();

  const renderContent = () => {
    switch (adminTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'orders': return <AdminOrders />;
      case 'products': return <AdminProducts />;
      case 'categories': return <AdminCategories />;
      case 'users': return <AdminUsers />;
      case 'settings': return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-['Inter',sans-serif]">
        {/* Admin Header */}
        <div className="sticky top-0 z-30 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <span className="text-xl">🛡️</span>
              </div>
              <div>
                <h1 className="text-base font-black text-white leading-none">Admin Panel</h1>
                <p className="text-white/60 text-xs mt-0.5">Oila Market boshqaruvi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/70 text-xs">Online</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 pb-28">{renderContent()}</div>

        {/* Bottom Nav - scrollable for 6 tabs */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl">
          <div className="flex items-center justify-around px-1 py-2 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setAdminTab(tab.key)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all flex-shrink-0 min-w-0 ${adminTab === tab.key ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
              >
                <div className={`w-9 h-6 flex items-center justify-center rounded-lg transition-all ${adminTab === tab.key ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                  <tab.icon size={17} strokeWidth={adminTab === tab.key ? 2.5 : 1.8} />
                </div>
                <span className="text-[9px] font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
