import React, { useEffect, useState } from 'react';
import {
  TrendingUp, ShoppingCart, RefreshCw,
  ArrowUpRight, Clock, CheckCircle, Truck, Users, Package
} from 'lucide-react';
import { getStats, getOrders, getWeeklyStats } from '../../api';
import { useStore } from '../../store';
import { Badge } from '../ui/Badge';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const formatPrice = (p: number) => p.toLocaleString('uz-UZ') + ' so\'m';

const DEMO_STATS = {
  totalRevenue: 4580000,
  todayRevenue: 320000,
  totalOrders: 142,
  todayOrders: 8,
  totalUsers: 89,
  newUsers: 5,
  totalProducts: 64,
};

const DEMO_WEEKLY = [
  { day: 'Dush', orders: 12, revenue: 580000 },
  { day: 'Sesh', orders: 8, revenue: 420000 },
  { day: 'Chor', orders: 15, revenue: 730000 },
  { day: 'Pay', orders: 20, revenue: 980000 },
  { day: 'Juma', orders: 18, revenue: 860000 },
  { day: 'Shan', orders: 25, revenue: 1200000 },
  { day: 'Yak', orders: 10, revenue: 480000 },
];

const DEMO_ORDERS = [
  { id: 'OM-001', userName: 'Alisher B.', total: 145000, status: 'new', createdAt: new Date().toISOString() },
  { id: 'OM-002', userName: 'Malika R.', total: 87000, status: 'delivering', createdAt: new Date(Date.now()-3600000).toISOString() },
  { id: 'OM-003', userName: 'Jasur T.', total: 260000, status: 'confirmed', createdAt: new Date(Date.now()-7200000).toISOString() },
  { id: 'OM-004', userName: 'Dilnoza K.', total: 55000, status: 'delivered', createdAt: new Date(Date.now()-86400000).toISOString() },
];

const STATUS_CONFIG: Record<string, { label: string; color: 'blue' | 'green' | 'yellow' | 'purple' | 'emerald' | 'red' | 'gray' }> = {
  new: { label: '🆕 Yangi', color: 'blue' },
  confirmed: { label: '✅ Tasdiqlangan', color: 'green' },
  preparing: { label: '🔄 Tayyorlanmoqda', color: 'yellow' },
  delivering: { label: '🚚 Yetkazilmoqda', color: 'purple' },
  delivered: { label: '✔️ Yetkazildi', color: 'emerald' },
  cancelled: { label: '❌ Bekor', color: 'red' },
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState(DEMO_STATS);
  const [weekly, setWeekly] = useState(DEMO_WEEKLY);
  const [recentOrders, setRecentOrders] = useState(DEMO_ORDERS);
  const [loading, setLoading] = useState(false);
  const { setAdminTab } = useStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, weeklyRes] = await Promise.all([
        getStats(), getOrders(), getWeeklyStats()
      ]);
      if (statsRes?.data) setStats(statsRes.data);
      if (ordersRes?.data?.length) setRecentOrders(ordersRes.data.slice(0, 5));
      if (weeklyRes?.data?.length) setWeekly(weeklyRes.data);
    } catch {}
    setLoading(false);
  };

  const statCards = [
    { label: 'Bugungi daromad', value: formatPrice(stats.todayRevenue), icon: TrendingUp, color: 'from-indigo-500 to-purple-600', sub: `+${formatPrice(stats.totalRevenue)} jami` },
    { label: 'Bugungi buyurtma', value: stats.todayOrders, icon: ShoppingCart, color: 'from-orange-400 to-rose-500', sub: `${stats.totalOrders} jami` },
    { label: 'Foydalanuvchilar', value: stats.totalUsers, icon: Users, color: 'from-emerald-400 to-teal-500', sub: `+${stats.newUsers} yangi` },
    { label: 'Mahsulotlar', value: stats.totalProducts, icon: Package, color: 'from-blue-400 to-cyan-500', sub: 'omborda' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">📊 Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={loadData} className={`w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 ${loading ? 'animate-spin' : ''}`}>
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <card.icon size={18} className="opacity-80" />
              <ArrowUpRight size={14} className="opacity-60" />
            </div>
            <p className="text-2xl font-black">{card.value}</p>
            <p className="text-xs font-semibold opacity-80 mt-0.5">{card.label}</p>
            <p className="text-[11px] opacity-60 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-1.5">
          <TrendingUp size={15} className="text-indigo-500" /> Haftalik buyurtmalar
        </h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weekly} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              formatter={(value) => [value + ' ta', 'Buyurtma']}
            />
            <Bar dataKey="orders" fill="url(#gradient)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Yangi', count: recentOrders.filter(o => o.status === 'new').length, icon: Clock, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Yetkazilmoqda', count: recentOrders.filter(o => o.status === 'delivering').length, icon: Truck, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Yetkazildi', count: recentOrders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
        ].map((item, i) => (
          <div key={i} className={`${item.color} rounded-2xl p-3 text-center`}>
            <item.icon size={18} className="mx-auto mb-1 opacity-70" />
            <p className="text-xl font-black text-gray-900 dark:text-white">{item.count}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">🆕 So'nggi buyurtmalar</h3>
          <button onClick={() => setAdminTab('orders')} className="text-xs text-indigo-600 font-medium">Hammasi</button>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {recentOrders.map(order => (
            <div key={order.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <ShoppingCart size={14} className="text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.userName}</p>
                <p className="text-xs text-gray-400">#{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
                <Badge color={STATUS_CONFIG[order.status]?.color || 'gray'} size="sm">
                  {STATUS_CONFIG[order.status]?.label || order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
