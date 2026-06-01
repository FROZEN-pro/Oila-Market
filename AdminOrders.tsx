import React, { useEffect, useState } from 'react';
import { Package, RefreshCw, Search, ChevronDown, Phone, MapPin, MessageSquare } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../../api';
import type { Order } from '../../types';
import { Badge } from '../ui/Badge';
import { BottomSheet } from '../ui/Modal';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

const formatPrice = (p: number) => p.toLocaleString('uz-UZ') + ' so\'m';
const formatDate = (d: string) => new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const STATUS_CONFIG: Record<string, { label: string; color: 'blue' | 'green' | 'yellow' | 'purple' | 'emerald' | 'red' | 'gray' }> = {
  new: { label: '🆕 Yangi', color: 'blue' },
  confirmed: { label: '✅ Tasdiqlangan', color: 'green' },
  preparing: { label: '🔄 Tayyorlanmoqda', color: 'yellow' },
  delivering: { label: '🚚 Yetkazilmoqda', color: 'purple' },
  delivered: { label: '✔️ Yetkazildi', color: 'emerald' },
  cancelled: { label: '❌ Bekor', color: 'red' },
};

const NEXT_STATUS: Record<string, string> = {
  new: 'confirmed',
  confirmed: 'preparing',
  preparing: 'delivering',
  delivering: 'delivered',
};

const DEMO_ORDERS: Order[] = [
  { id: 'OM-001', userId: '1', userName: 'Alisher Bekmurodov', userPhone: '+998901234567', items: [{ product: { id: '1', name: 'Olma Fuji', price: 15000, categoryId: '4', images: [], inStock: true, description: '', unit: 'kg' }, quantity: 3 }, { product: { id: '5', name: 'Non', price: 5000, categoryId: '7', images: [], inStock: true, description: '', unit: 'dona' }, quantity: 2 }], subtotal: 55000, deliveryFee: 0, total: 55000, address: 'Toshkent, Chilonzor 12-kvartal, 45-uy', status: 'new', paymentMethod: 'cash', createdAt: new Date().toISOString() },
  { id: 'OM-002', userId: '2', userName: 'Malika Rahimova', userPhone: '+998901111111', items: [{ product: { id: '6', name: 'Shokolad tort', price: 120000, categoryId: '3', images: [], inStock: true, description: '', unit: 'kg' }, quantity: 1 }], subtotal: 120000, deliveryFee: 0, total: 120000, address: 'Toshkent, Yunusobod 7-mavze', status: 'delivering', paymentMethod: 'card', createdAt: new Date(Date.now()-3600000).toISOString() },
  { id: 'OM-003', userId: '3', userName: 'Jasur Toshmatov', userPhone: '+998902222222', items: [{ product: { id: '3', name: 'Mol go\'shti', price: 75000, categoryId: '5', images: [], inStock: true, description: '', unit: 'kg' }, quantity: 2 }], subtotal: 150000, deliveryFee: 0, total: 150000, address: 'Toshkent, Mirzo Ulugbek 3-mavze', status: 'confirmed', paymentMethod: 'transfer', createdAt: new Date(Date.now()-7200000).toISOString() },
];

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders();
      if (res?.data?.length) setOrders(res.data);
    } catch {}
    setLoading(false);
  };

  const handleStatusUpdate = async (order: Order, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === order.id) setSelectedOrder({ ...order, status: newStatus });
      toast.success(`✅ Status yangilandi: ${STATUS_CONFIG[newStatus]?.label}`);
    } catch {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === order.id) setSelectedOrder({ ...order, status: newStatus });
      toast.success(`Status yangilandi!`);
    }
    setUpdatingStatus(false);
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.userName.toLowerCase().includes(search.toLowerCase()) || o.userPhone?.includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900 dark:text-white">📦 Buyurtmalar</h2>
        <button onClick={loadOrders} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <RefreshCw size={15} className={loading ? 'animate-spin text-indigo-500' : 'text-gray-500'} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ID, ism yoki telefon..."
          className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {['all', 'new', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          >
            {s === 'all' ? 'Hammasi' : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-500">{filtered.length} ta buyurtma</p>

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400">#{order.id}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{order.userName}</p>
                {order.userPhone && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} /> {order.userPhone}</p>}
              </div>
              <Badge color={STATUS_CONFIG[order.status]?.color || 'gray'}>
                {STATUS_CONFIG[order.status]?.label || order.status}
              </Badge>
            </div>

            <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <MapPin size={10} /> {order.address}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">{order.items.length} ta mahsulot • {formatDate(order.createdAt)}</p>
                <p className="text-base font-black text-indigo-600">{formatPrice(order.total)}</p>
              </div>
              <div className="flex gap-2">
                {NEXT_STATUS[order.status] && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusUpdate(order, NEXT_STATUS[order.status])}
                    loading={updatingStatus}
                  >
                    {STATUS_CONFIG[NEXT_STATUS[order.status]]?.label}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                  <ChevronDown size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Sheet */}
      {selectedOrder && (
        <BottomSheet isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Buyurtma #${selectedOrder.id}`}>
          <div className="p-4 space-y-4">
            {/* Customer Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white">👤 Mijoz ma'lumotlari</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.userName}</span>
              </div>
              {selectedOrder.userPhone && (
                <a href={`tel:${selectedOrder.userPhone}`} className="flex items-center gap-2 text-sm text-indigo-600">
                  <Phone size={13} /> {selectedOrder.userPhone}
                </a>
              )}
              {selectedOrder.userTelegramId && (
                <a href={`https://t.me/${selectedOrder.userTelegramId}`} className="flex items-center gap-2 text-sm text-indigo-600">
                  <MessageSquare size={13} /> Telegram'da yozing
                </a>
              )}
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={13} className="flex-shrink-0 mt-0.5" /> {selectedOrder.address}
              </div>
            </div>

            {/* Status Change */}
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Statusni o'zgartirish</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusUpdate(selectedOrder, key)}
                    disabled={selectedOrder.status === key}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${selectedOrder.status === key ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Mahsulotlar</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{item.quantity} x {formatPrice(item.product.price)}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4">
              <span className="font-bold text-gray-900 dark:text-white">Jami to'lov:</span>
              <span className="text-xl font-black text-indigo-600">{formatPrice(selectedOrder.total)}</span>
            </div>

            {selectedOrder.note && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
                <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-1">📝 Izoh:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedOrder.note}</p>
              </div>
            )}
          </div>
        </BottomSheet>
      )}
    </div>
  );
};
