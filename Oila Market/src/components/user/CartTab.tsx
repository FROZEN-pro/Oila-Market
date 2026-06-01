import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Tag, MapPin, ChevronRight, Package, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store';
import { createOrder, validatePromoCode } from '../../api';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Modal, BottomSheet } from '../ui/Modal';
import toast from 'react-hot-toast';

const formatPrice = (p: number) => p.toLocaleString('uz-UZ') + ' so\'m';

export const CartTab: React.FC = () => {
  const { cart, updateCartItem, clearCart, cartTotal, currentUser, setActiveTab } = useStore();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showAddressSheet, setShowAddressSheet] = useState(false);

  const DELIVERY_FEE = 15000;
  const FREE_DELIVERY_FROM = 150000;
  const subtotal = cartTotal();
  const isDeliveryFree = subtotal >= FREE_DELIVERY_FROM;
  const delivery = isDeliveryFree ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery - promoDiscount;

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await validatePromoCode(promoCode, subtotal);
      if (res?.valid) {
        setPromoDiscount(res.discount || 0);
        setAppliedPromo(promoCode);
        toast.success(`🎉 Promo kod qo'llanildi! -${formatPrice(res.discount)} chegirma`);
      } else {
        toast.error('Promo kod noto\'g\'ri yoki muddati o\'tgan');
      }
    } catch {
      // Demo mode
      if (promoCode === 'OILA10') {
        const d = Math.round(subtotal * 0.1);
        setPromoDiscount(d);
        setAppliedPromo(promoCode);
        toast.success(`🎉 10% chegirma: -${formatPrice(d)}`);
      } else {
        toast.error('Promo kod topilmadi');
      }
    }
    setPromoLoading(false);
  };

  const handleOrder = async () => {
    if (!address.trim()) { toast.error('Manzilni kiriting'); return; }
    if (!phone.trim()) { toast.error('Telefon raqamini kiriting'); return; }
    setOrderLoading(true);
    try {
      const newOrderId = `OM-${Date.now()}`;
      const orderData = {
        id: newOrderId,
        userId: currentUser?.id || 'guest',
        userName: currentUser?.name || 'Mehmon',
        userPhone: phone,
        userTelegramId: currentUser?.telegramId,
        items: cart.map(i => ({ productId: i.product.id, productName: i.product.name, quantity: i.quantity, price: i.product.price })),
        subtotal,
        deliveryFee: delivery,
        discount: promoDiscount,
        promoCode: appliedPromo,
        total,
        address,
        note,
        paymentMethod,
        status: 'new',
        createdAt: new Date().toISOString(),
      };
      await createOrder(orderData);
      setOrderId(newOrderId);
      clearCart();
      setStep('success');
    } catch {
      // Demo
      const newOrderId = `OM-${Date.now()}`;
      setOrderId(newOrderId);
      clearCart();
      setStep('success');
    }
    setOrderLoading(false);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30">
          <span className="text-4xl">✅</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Buyurtma qabul qilindi!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-1">Buyurtma raqami:</p>
        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">{orderId}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Tez orada siz bilan bog'lanamiz. Buyurtmangizni kuzatib boring.</p>
        <div className="flex gap-3 w-full max-w-xs">
          <Button variant="outline" fullWidth onClick={() => setActiveTab('orders')}>Buyurtmalar</Button>
          <Button variant="primary" fullWidth onClick={() => { setStep('cart'); setActiveTab('home'); }}>Bosh sahifa</Button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <ShoppingCart size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Savat bo'sh</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Mahsulotlarni savatchaga qo'shing</p>
        <Button variant="primary" onClick={() => setActiveTab('home')}>
          Xarid qilish
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-32 min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center justify-between">
          {step === 'checkout' && (
            <button onClick={() => setStep('cart')} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mr-2">
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {step === 'cart' ? <><ShoppingCart size={20} className="text-indigo-600" /> Savat</> : <><Package size={20} className="text-indigo-600" /> Buyurtma rasmiylash</>}
          </h1>
          {step === 'cart' && (
            <button onClick={clearCart} className="text-xs text-red-500 font-medium flex items-center gap-1">
              <Trash2 size={13} /> Tozalash
            </button>
          )}
        </div>
        {step === 'cart' && (
          <div className="mt-2">
            {!isDeliveryFree && (
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-2 rounded-xl">
                <span className="text-xs text-indigo-600 dark:text-indigo-400">
                  🚚 Bepul yetkazib berish uchun <strong>{formatPrice(FREE_DELIVERY_FROM - subtotal)}</strong> qo'shing
                </span>
              </div>
            )}
            {isDeliveryFree && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-xl">
                <span className="text-xs text-emerald-600 dark:text-emerald-400">✅ Bepul yetkazib berish faollashdi!</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {step === 'cart' ? (
          <>
            {/* Cart Items */}
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-sm flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center flex-shrink-0">
                    {item.product.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover rounded-xl" />
                    ) : <span className="text-2xl">🛍️</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{item.product.name}</h3>
                    {item.product.unit && <p className="text-xs text-gray-400">{item.product.unit}</p>}
                    <p className="text-sm font-bold text-indigo-600 mt-1">{formatPrice(item.product.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => updateCartItem(item.product.id, 0)} className="text-red-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-2 py-1">
                      <button onClick={() => updateCartItem(item.product.id, item.quantity - 1)} className="text-gray-500 hover:text-indigo-600">
                        <Minus size={13} />
                      </button>
                      <span className="text-sm font-bold text-gray-900 dark:text-white w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartItem(item.product.id, item.quantity + 1)} className="text-gray-500 hover:text-indigo-600">
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                <Tag size={15} className="text-indigo-500" /> Promo kod
              </h3>
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2.5 rounded-xl">
                  <span className="text-sm font-semibold text-emerald-600">{appliedPromo} ✅</span>
                  <button onClick={() => { setAppliedPromo(''); setPromoDiscount(0); setPromoCode(''); }} className="text-xs text-red-500">Bekor</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Promo kodni kiriting"
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                  />
                  <Button variant="outline" size="md" loading={promoLoading} onClick={applyPromo}>Qo'llash</Button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Hisob-kitob</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Mahsulotlar</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Yetkazib berish</span>
                  <span className={`font-medium ${isDeliveryFree ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                    {isDeliveryFree ? 'Bepul ✅' : formatPrice(delivery)}
                  </span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-500">
                    <span>Chegirma ({appliedPromo})</span>
                    <span className="font-medium">-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">Jami</span>
                  <span className="font-black text-lg text-indigo-600 dark:text-indigo-400">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Checkout Form */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <MapPin size={15} className="text-indigo-500" /> Yetkazib berish ma'lumotlari
              </h3>
              <Input
                label="Telefon raqam"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                type="tel"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Manzil</label>
                <div className="relative">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ko'cha, uy raqami, kirish..."
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                {currentUser?.addresses?.length ? (
                  <button onClick={() => setShowAddressSheet(true)} className="mt-2 text-xs text-indigo-600 flex items-center gap-1">
                    <MapPin size={12} /> Saqlangan manzillardan tanlash
                  </button>
                ) : null}
              </div>
              <Textarea
                label="Izoh (ixtiyoriy)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Maxsus so'rovlar, qo'ng'iroq qilish vaqti..."
                rows={2}
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">💳 To'lov usuli</h3>
              <div className="space-y-2">
                {[
                  { key: 'cash', label: '💵 Naqd pul', desc: 'Yetkazib berishda to\'lash' },
                  { key: 'card', label: '💳 Karta', desc: 'Visa, Mastercard, UzCard' },
                  { key: 'transfer', label: '📱 Bank o\'tkazma', desc: 'Payme, Click' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setPaymentMethod(opt.key as typeof paymentMethod)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${paymentMethod === opt.key ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' : 'border-gray-100 dark:border-gray-800'}`}
                  >
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-semibold ${paymentMethod === opt.key ? 'text-indigo-600' : 'text-gray-900 dark:text-white'}`}>{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                    {paymentMethod === opt.key && <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary Compact */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900 dark:text-white">Jami to'lov:</span>
                <span className="text-xl font-black text-indigo-600">{formatPrice(total)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl">
        {step === 'cart' ? (
          <Button variant="primary" size="lg" fullWidth onClick={() => setStep('checkout')}>
            Buyurtma berish → {formatPrice(total)}
          </Button>
        ) : (
          <Button variant="success" size="lg" fullWidth loading={orderLoading} onClick={handleOrder}>
            ✅ Buyurtmani tasdiqlash
          </Button>
        )}
      </div>

      {/* Address sheet */}
      {showAddressSheet && (
        <BottomSheet isOpen={showAddressSheet} onClose={() => setShowAddressSheet(false)} title="Manzillar">
          <div className="p-4 space-y-3">
            {currentUser?.addresses?.map(addr => (
              <button
                key={addr.id}
                onClick={() => { setAddress(addr.address); setShowAddressSheet(false); }}
                className="w-full flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-left"
              >
                <MapPin size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{addr.title}</p>
                  <p className="text-xs text-gray-500">{addr.address}</p>
                </div>
              </button>
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  );
};
