import React, { useEffect, useState } from 'react';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, RefreshCw } from 'lucide-react';
import { useStore } from '../../store';
import { getUserOrders } from '../../api';
import type { Order } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BottomSheet } from '../ui/Modal';

const formatPrice = (p: number) => p.toLocaleString('uz-UZ') + ' so\'m';
const formatDate = (d: string) => new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const STATUS_CONFIG: Record<string, { label: string; color: 'blue' | 'green' | 'yellow' | 'purple' | 'emerald' | 'red' | 'gray'; icon: React.ReactNode }> = {
  new: { label: '🆕 Yangi', color: 'blue', icon: <Clock size={14} /> },
  confirmed: { label: '✅ Tasdiqlangan', color: 'green', icon: <CheckCircle size={14} /> },
  preparing: { label: '🔄 Tayyorlanmoqda', color: 'yellow', icon: <RefreshCw size={14} /> },
  delivering: { label: '🚚 Yetkazilmoqda', color: 'purple', icon: <Truck size={14} /> },
  delivered: { label: '✔️ Yetkazildi', color: 'emerald', icon: <CheckCircle size={14} /> },
  cancelled: { label: '❌ Bekor qilindi', color: 'red', icon: <XCircle size={14} /> },
};

const DEMO_ORDERS: Order[] = [
  {
    id: 'OM-001',
    userId: '1',
    userName: 'Foydalanuvchi',
    items: [
      { product: { id: '1', name: 'Olma Fuji', price: 15000, categoryId: '4', images: [], inStock: true, description: '', unit: 'kg' }, quantity: 2 },
      { product: { id: '5', name: 'Non', price: 5000, categoryId: '7', images: [], inStock: true, description: '', unit: 'dona' }, quantity: 1 },
    ],
    subtotal: 35000,
    deliveryFee: 15000,
    total: 50000,
    address: 'Toshkent, Chilonzor 12-kvartal',
    status: 'delivering',
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'OM-002',
    userId: '1',
    userName: 'Foydalanuvchi',
    items: [
      { product: { id: '6', name: 'Shokolad tort', price: 120000, categoryId: '3', images: [], inStock: true, description: '', unit: 'kg' }, quantity: 1 },
    ],
    subtotal: 120000,
    deliveryFee: 0,
    total: 120000,
    address: 'Toshkent, Yunusobod 7-mavze',
    status: 'delivered',
    paymentMethod: 'card',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const STEPS = ['new', 'confirmed', 'preparing', 'delivering', 'delivered'];

export const OrdersTab: React.FC = () => {
  const { currentUser, setActiveTab } = useStore();
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const res = await getUserOrders(currentUser.id);
      if (res?.data?.length) setOrders(res.data);
    } catch {}
    setLoading(false);
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const getStepIndex = (status: string) => STEPS.indexOf(status);

  return (
    <div className="pb-24 min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package size={20} className="text-indigo-600" /> Buyurtmalarim
          </h1>
          <button onClick={loadOrders} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: 'all', label: 'Hammasi' },
            { key: 'new', label: '🆕 Yangi' },
            { key: 'delivering', label: '🚚 Yetkazilmoqda' },
            { key: 'delivered', label: '✔️ Yetkazildi' },
            { key: 'cancelled', label: '❌ Bekor' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === tab.key ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Buyurtmalar yo'q</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Hali buyurtma bermadingiz</p>
            <Button variant="primary" onClick={() => setActiveTab('home')}>Xarid qilish</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['new'];
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Buyurtma #{order.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge color={status.color}>{status.label}</Badge>
                  </div>

                  {/* Progress for active orders */}
                  {['new', 'confirmed', 'preparing', 'delivering'].includes(order.status) && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1">
                        {STEPS.slice(0, -1).map((step, i) => (
                          <React.Fragment key={step}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${getStepIndex(order.status) >= i ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                              {i + 1}
                            </div>
                            {i < 3 && <div className={`flex-1 h-0.5 ${getStepIndex(order.status) > i ? 'bg-indigo-600' : 'bg-gray-100 dark:bg-gray-800'}`} />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.items.length} ta mahsulot
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600 text-xs font-medium">
                      Batafsil <ChevronRight size={14} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Sheet */}
      {selectedOrder && (
        <BottomSheet isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Buyurtma #${selectedOrder.id}`}>
          <div className="p-4 space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/20 px-4 py-3 rounded-2xl">
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Holat:</span>
              <Badge color={STATUS_CONFIG[selectedOrder.status]?.color || 'blue'}>
                {STATUS_CONFIG[selectedOrder.status]?.label}
              </Badge>
            </div>

            {/* Progress */}
            {['new', 'confirmed', 'preparing', 'delivering'].includes(selectedOrder.status) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Buyurtma holati</p>
                <div className="space-y-3">
                  {[
                    { step: 'new', label: 'Qabul qilindi' },
                    { step: 'confirmed', label: 'Tasdiqlandi' },
                    { step: 'preparing', label: 'Tayyorlanmoqda' },
                    { step: 'delivering', label: 'Yetkazilmoqda' },
                    { step: 'delivered', label: 'Yetkazildi' },
                  ].map(({ step, label }, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${getStepIndex(selectedOrder.status) >= i ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                        {getStepIndex(selectedOrder.status) >= i ? '✓' : i + 1}
                      </div>
                      <span className={`text-sm ${getStepIndex(selectedOrder.status) >= i ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Mahsulotlar</p>
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

            {/* Total */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Mahsulotlar</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Yetkazib berish</span>
                <span>{selectedOrder.deliveryFee > 0 ? formatPrice(selectedOrder.deliveryFee) : 'Bepul'}</span>
              </div>
              {selectedOrder.discount && (
                <div className="flex justify-between text-sm text-emerald-500">
                  <span>Chegirma</span>
                  <span>-{formatPrice(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                <span className="font-bold text-gray-900 dark:text-white">Jami</span>
                <span className="font-black text-indigo-600">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Address & Payment */}
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>📍</span>
                <span>{selectedOrder.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>💳</span>
                <span>{selectedOrder.paymentMethod === 'cash' ? 'Naqd pul' : selectedOrder.paymentMethod === 'card' ? 'Karta' : 'Bank o\'tkazma'}</span>
              </div>
            </div>

            {selectedOrder.status === 'new' && (
              <button className="w-full py-3 rounded-2xl border-2 border-red-500 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors">
                ❌ Buyurtmani bekor qilish
              </button>
            )}
          </div>
        </BottomSheet>
      )}
    </div>
  );
};
