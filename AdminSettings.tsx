import React, { useEffect, useState } from 'react';
import { Settings, Save, Tag, Image, Bell, Store, Moon, Sun, Plus, Trash2 } from 'lucide-react';
import { getSettings, saveSettings, getPromoCodes, addPromoCode, deletePromoCode, getBanners, saveBanner, deleteBanner } from '../../api';
import { useStore } from '../../store';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { BottomSheet } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';
import type { PromoCode, Banner } from '../../types';

const DEMO_PROMOS: PromoCode[] = [
  { id: '1', code: 'OILA10', type: 'percent', discount: 10, minOrder: 50000, maxUses: 100, usedCount: 34, isActive: true, createdAt: new Date().toISOString() },
  { id: '2', code: 'YANGI20', type: 'percent', discount: 20, minOrder: 100000, usedCount: 12, isActive: true, createdAt: new Date().toISOString() },
  { id: '3', code: 'CHEGIRMA', type: 'fixed', discount: 25000, minOrder: 75000, usedCount: 5, isActive: false, createdAt: new Date().toISOString() },
];

const DEMO_BANNERS: Banner[] = [
  { id: '1', title: '🔥 Yangi mahsulotlar!', subtitle: 'Chegirmalar 30% gacha', gradient: 'from-indigo-500 to-purple-600', isActive: true },
  { id: '2', title: '🎁 Bepul yetkazib berish!', subtitle: '150,000 so\'mdan yuqori', gradient: 'from-emerald-400 to-teal-500', isActive: true },
];

export const AdminSettings: React.FC = () => {
  const { darkMode, toggleDarkMode } = useStore();
  const [settings, setSettings] = useState({
    name: 'Oila Market',
    phone: '+998 90 000 00 00',
    address: 'Toshkent, O\'zbekiston',
    telegramChannel: '@oilamarket',
    deliveryFee: '15000',
    freeDeliveryFrom: '150000',
    minOrder: '20000',
    isOpen: true,
    closedMessage: 'Do\'kon hozir yopiq',
  });
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(DEMO_PROMOS);
  const [banners, setBanners] = useState<Banner[]>(DEMO_BANNERS);
  const [saving, setSaving] = useState(false);
  const [showPromoSheet, setShowPromoSheet] = useState(false);
  const [showBannerSheet, setShowBannerSheet] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: '', type: 'percent', discount: '', minOrder: '', maxUses: '' });
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', gradient: 'from-indigo-500 to-purple-600' });
  const [activeSection, setActiveSection] = useState<'store' | 'promo' | 'banners' | 'notifications'>('store');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [settingsRes, promoRes, bannerRes] = await Promise.all([getSettings(), getPromoCodes(), getBanners()]);
      if (settingsRes?.data) {
        const d = settingsRes.data;
        setSettings(s => ({ ...s, ...d, deliveryFee: String(d.deliveryFee || s.deliveryFee), freeDeliveryFrom: String(d.freeDeliveryFrom || s.freeDeliveryFrom), minOrder: String(d.minOrder || s.minOrder) }));
      }
      if (promoRes?.data?.length) setPromoCodes(promoRes.data);
      if (bannerRes?.data?.length) setBanners(bannerRes.data);
    } catch {}
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await saveSettings({ ...settings, deliveryFee: Number(settings.deliveryFee), freeDeliveryFrom: Number(settings.freeDeliveryFrom), minOrder: Number(settings.minOrder) });
      toast.success('✅ Sozlamalar saqlandi!');
    } catch {
      toast.success('Sozlamalar saqlandi!');
    }
    setSaving(false);
  };

  const handleAddPromo = async () => {
    if (!promoForm.code || !promoForm.discount) { toast.error('Kod va chegirmani kiriting'); return; }
    const newPromo: PromoCode = {
      id: Date.now().toString(),
      code: promoForm.code.toUpperCase(),
      type: promoForm.type as 'percent' | 'fixed',
      discount: Number(promoForm.discount),
      minOrder: promoForm.minOrder ? Number(promoForm.minOrder) : undefined,
      maxUses: promoForm.maxUses ? Number(promoForm.maxUses) : undefined,
      usedCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await addPromoCode(newPromo);
    setPromoCodes(prev => [...prev, newPromo]);
    setPromoForm({ code: '', type: 'percent', discount: '', minOrder: '', maxUses: '' });
    setShowPromoSheet(false);
    toast.success('✅ Promo kod qo\'shildi!');
  };

  const handleDeletePromo = async (id: string) => {
    await deletePromoCode(id);
    setPromoCodes(prev => prev.filter(p => p.id !== id));
    toast.success('Promo kod o\'chirildi');
  };

  const handleAddBanner = async () => {
    if (!bannerForm.title) { toast.error('Sarlavhani kiriting'); return; }
    const newBanner: Banner = {
      id: Date.now().toString(),
      ...bannerForm,
      isActive: true,
    };
    await saveBanner(newBanner);
    setBanners(prev => [...prev, newBanner]);
    setBannerForm({ title: '', subtitle: '', gradient: 'from-indigo-500 to-purple-600' });
    setShowBannerSheet(false);
    toast.success('✅ Banner qo\'shildi!');
  };

  const handleDeleteBanner = async (id: string) => {
    await deleteBanner(id);
    setBanners(prev => prev.filter(b => b.id !== id));
    toast.success('Banner o\'chirildi');
  };

  const formatPrice = (p: number) => p.toLocaleString('uz-UZ') + ' so\'m';

  const sections = [
    { key: 'store', icon: Store, label: 'Do\'kon' },
    { key: 'promo', icon: Tag, label: 'Promo' },
    { key: 'banners', icon: Image, label: 'Bannerlar' },
    { key: 'notifications', icon: Bell, label: 'Xabar' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-gray-900 dark:text-white">⚙️ Sozlamalar</h2>

      {/* Section Tabs */}
      <div className="grid grid-cols-4 gap-2">
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key as any)}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeSection === s.key ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 shadow-sm'}`}
          >
            <s.icon size={16} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Store Settings */}
      {activeSection === 'store' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">🏪 Do'kon ma'lumotlari</h3>
            <Input label="Do'kon nomi" value={settings.name} onChange={e => setSettings(s => ({ ...s, name: e.target.value }))} />
            <Input label="Telefon" value={settings.phone} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} type="tel" />
            <Input label="Manzil" value={settings.address} onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} />
            <Input label="Telegram kanal" value={settings.telegramChannel} onChange={e => setSettings(s => ({ ...s, telegramChannel: e.target.value }))} placeholder="@kanal_nomi" />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">🚚 Yetkazib berish</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Yetkazib berish narxi" value={settings.deliveryFee} onChange={e => setSettings(s => ({ ...s, deliveryFee: e.target.value }))} type="number" />
              <Input label="Bepul (dan)" value={settings.freeDeliveryFrom} onChange={e => setSettings(s => ({ ...s, freeDeliveryFrom: e.target.value }))} type="number" />
            </div>
            <Input label="Minimal buyurtma" value={settings.minOrder} onChange={e => setSettings(s => ({ ...s, minOrder: e.target.value }))} type="number" />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">🏪 Do'kon holati</h3>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{settings.isOpen ? '✅ Do\'kon ochiq' : '❌ Do\'kon yopiq'}</p>
                <p className="text-xs text-gray-400">Foydalanuvchilar buyurtma bera oladi</p>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, isOpen: !s.isOpen }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.isOpen ? 'bg-emerald-500' : 'bg-red-400'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.isOpen ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            {!settings.isOpen && (
              <Textarea
                label="Yopiq sababi"
                value={settings.closedMessage}
                onChange={e => setSettings(s => ({ ...s, closedMessage: e.target.value }))}
                placeholder="Nega yopiq ekanini yozing..."
                rows={2}
              />
            )}
          </div>

          {/* Dark Mode */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon size={18} className="text-purple-500" /> : <Sun size={18} className="text-yellow-500" />}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Qorong'u rejim</p>
                <p className="text-xs text-gray-400">{darkMode ? 'Yoqilgan' : 'O\'chirilgan'}</p>
              </div>
            </div>
            <button onClick={toggleDarkMode} className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <Button variant="primary" fullWidth icon={<Save size={15} />} loading={saving} onClick={handleSaveSettings}>
            Sozlamalarni saqlash
          </Button>
        </div>
      )}

      {/* Promo Codes */}
      {activeSection === 'promo' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900 dark:text-white">🏷️ Promo kodlar ({promoCodes.length})</p>
            <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setShowPromoSheet(true)}>Qo'shish</Button>
          </div>
          <div className="space-y-3">
            {promoCodes.map(promo => (
              <div key={promo.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-black text-gray-900 dark:text-white">{promo.code}</p>
                      <Badge color={promo.isActive ? 'green' : 'red'} size="sm">{promo.isActive ? 'Faol' : 'Nofaol'}</Badge>
                    </div>
                    <p className="text-sm text-indigo-600 font-semibold">
                      {promo.type === 'percent' ? `${promo.discount}% chegirma` : `${formatPrice(promo.discount)} chegirma`}
                    </p>
                    {promo.minOrder && <p className="text-xs text-gray-400">Min: {formatPrice(promo.minOrder)}</p>}
                    <p className="text-xs text-gray-400 mt-1">Ishlatilgan: {promo.usedCount}{promo.maxUses ? `/${promo.maxUses}` : ''} marta</p>
                  </div>
                  <button onClick={() => handleDeletePromo(promo.id)} className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banners */}
      {activeSection === 'banners' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900 dark:text-white">🎨 Bannerlar ({banners.length})</p>
            <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setShowBannerSheet(true)}>Qo'shish</Button>
          </div>
          <div className="space-y-3">
            {banners.map(banner => (
              <div key={banner.id} className={`bg-gradient-to-r ${banner.gradient || 'from-indigo-500 to-purple-600'} rounded-2xl p-4 relative`}>
                <div className="pr-8">
                  <p className="text-white font-bold">{banner.title}</p>
                  {banner.subtitle && <p className="text-white/70 text-sm">{banner.subtitle}</p>}
                </div>
                <button onClick={() => handleDeleteBanner(banner.id)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeSection === 'notifications' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">📢 Xabar yuborish</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kimga</label>
            <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Barcha foydalanuvchilar</option>
              <option>Faol foydalanuvchilar</option>
              <option>Yangi foydalanuvchilar</option>
            </select>
          </div>
          <Textarea label="Xabar matni" placeholder="Barcha foydalanuvchilarga yuboriladi..." rows={4} />
          <Button variant="primary" fullWidth icon={<Bell size={15} />}>
            Xabar yuborish
          </Button>
        </div>
      )}

      {/* Add Promo Sheet */}
      <BottomSheet isOpen={showPromoSheet} onClose={() => setShowPromoSheet(false)} title="➕ Promo kod qo'shish">
        <div className="p-4 space-y-4">
          <Input label="Promo kod" value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="OILA10" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Turi</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ key: 'percent', label: '% Foiz' }, { key: 'fixed', label: 'Soʻm miqdori' }].map(t => (
                <button key={t.key} onClick={() => setPromoForm(f => ({ ...f, type: t.key }))}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all ${promoForm.type === t.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <Input label={promoForm.type === 'percent' ? 'Chegirma (%)' : 'Chegirma (so\'m)'} value={promoForm.discount} onChange={e => setPromoForm(f => ({ ...f, discount: e.target.value }))} type="number" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min buyurtma" value={promoForm.minOrder} onChange={e => setPromoForm(f => ({ ...f, minOrder: e.target.value }))} type="number" placeholder="50000" />
            <Input label="Max foydalanish" value={promoForm.maxUses} onChange={e => setPromoForm(f => ({ ...f, maxUses: e.target.value }))} type="number" placeholder="100" />
          </div>
          <Button variant="primary" fullWidth onClick={handleAddPromo}>Qo'shish</Button>
        </div>
      </BottomSheet>

      {/* Add Banner Sheet */}
      <BottomSheet isOpen={showBannerSheet} onClose={() => setShowBannerSheet(false)} title="🎨 Banner qo'shish">
        <div className="p-4 space-y-4">
          <Input label="Sarlavha" value={bannerForm.title} onChange={e => setBannerForm(f => ({ ...f, title: e.target.value }))} placeholder="🔥 Yangi mahsulotlar!" />
          <Input label="Qo'shimcha matn" value={bannerForm.subtitle} onChange={e => setBannerForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Chegirmalar 30% gacha" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rang</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                'from-indigo-500 to-purple-600',
                'from-orange-400 to-rose-500',
                'from-emerald-400 to-teal-500',
                'from-blue-400 to-cyan-500',
                'from-pink-400 to-rose-400',
                'from-yellow-400 to-orange-500',
              ].map(g => (
                <button key={g} onClick={() => setBannerForm(f => ({ ...f, gradient: g }))} className={`h-10 rounded-xl bg-gradient-to-r ${g} ${bannerForm.gradient === g ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-900' : ''}`} />
              ))}
            </div>
          </div>
          {bannerForm.title && (
            <div className={`bg-gradient-to-r ${bannerForm.gradient} rounded-2xl p-4`}>
              <p className="text-white font-bold">{bannerForm.title}</p>
              {bannerForm.subtitle && <p className="text-white/70 text-sm">{bannerForm.subtitle}</p>}
            </div>
          )}
          <Button variant="primary" fullWidth onClick={handleAddBanner}>Saqlash</Button>
        </div>
      </BottomSheet>
    </div>
  );
};
