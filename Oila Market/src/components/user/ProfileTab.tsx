import React, { useState, useRef } from 'react';
import {
  User, Edit3, MapPin, Phone, Moon, Sun, Heart, Package,
  ChevronRight, LogOut, Shield, Star, Bell, HelpCircle, Info,
  Plus, Trash2, Check, Camera
} from 'lucide-react';
import { useStore } from '../../store';
import { updateUserProfile, uploadImage } from '../../api';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { BottomSheet, Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';
import type { Address } from '../../types';

export const ProfileTab: React.FC = () => {
  const { currentUser, updateUser, darkMode, toggleDarkMode, wishlist, cart, setActiveTab } = useStore();
  const [editSheet, setEditSheet] = useState(false);
  const [addressSheet, setAddressSheet] = useState(false);
  const [addAddressSheet, setAddAddressSheet] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddr, setNewAddr] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        updateUser({ photo: url });
        if (currentUser?.telegramId) {
          await updateUserProfile(currentUser.telegramId, { photo: url });
        }
        toast.success('Profil rasm yangilandi!');
      } else {
        // Demo: use local URL
        const localUrl = URL.createObjectURL(file);
        updateUser({ photo: localUrl });
        toast.success('Profil rasm yangilandi!');
      }
    } catch {
      toast.error('Rasm yuklanmadi');
    }
    setPhotoLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      updateUser({ name: editName, phone: editPhone });
      if (currentUser?.telegramId) {
        await updateUserProfile(currentUser.telegramId, { name: editName, phone: editPhone });
      }
      toast.success('Profil yangilandi!');
      setEditSheet(false);
    } catch {
      toast.error('Xatolik yuz berdi');
    }
    setSaving(false);
  };

  const handleAddAddress = () => {
    if (!newAddrTitle.trim() || !newAddr.trim()) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }
    const newAddress: Address = {
      id: Date.now().toString(),
      title: newAddrTitle,
      address: newAddr,
      isDefault: (currentUser?.addresses?.length || 0) === 0,
    };
    const addresses = [...(currentUser?.addresses || []), newAddress];
    updateUser({ addresses });
    setNewAddrTitle('');
    setNewAddr('');
    setAddAddressSheet(false);
    toast.success('Manzil qo\'shildi!');
  };

  const handleDeleteAddress = (id: string) => {
    const addresses = (currentUser?.addresses || []).filter(a => a.id !== id);
    updateUser({ addresses });
    toast.success('Manzil o\'chirildi');
  };

  const handleSetDefaultAddress = (id: string) => {
    const addresses = (currentUser?.addresses || []).map(a => ({ ...a, isDefault: a.id === id }));
    updateUser({ addresses });
    const addr = addresses.find(a => a.id === id);
    if (addr) updateUser({ address: addr.address });
    toast.success('Asosiy manzil o\'rnatildi');
  };

  const stats = [
    { label: 'Buyurtmalar', value: currentUser?.totalOrders || 0, icon: '📦', tab: 'orders' },
    { label: 'Sevimlilar', value: wishlist.length, icon: '❤️', tab: 'home' },
    { label: 'Savat', value: cart.length, icon: '🛒', tab: 'cart' },
  ];

  return (
    <div className="pb-24 min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 px-4 pt-6 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-8 w-20 h-20 bg-white rounded-full" />
        </div>
        <div className="flex items-center justify-between mb-4 relative">
          <h1 className="text-lg font-bold text-white">👤 Profil</h1>
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        {/* Avatar */}
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center">
              {currentUser?.photo ? (
                <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{currentUser?.name?.charAt(0) || '👤'}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={photoLoading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-lg"
            >
              {photoLoading ? <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <Camera size={12} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{currentUser?.name || 'Foydalanuvchi'}</h2>
              {currentUser?.id && <Badge color="emerald" size="sm">✓ Tasdiqlangan</Badge>}
            </div>
            <p className="text-white/70 text-sm mt-0.5">@{currentUser?.username || 'username'}</p>
            {currentUser?.phone && <p className="text-white/70 text-sm">{currentUser.phone}</p>}
            <button
              onClick={() => { setEditName(currentUser?.name || ''); setEditPhone(currentUser?.phone || ''); setEditSheet(true); }}
              className="mt-2 flex items-center gap-1 text-white/90 text-xs font-medium bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
            >
              <Edit3 size={11} /> Tahrirlash
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(stat.tab)}
              className="bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-lg text-center hover:shadow-xl transition-shadow"
            >
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 mt-2">
        {/* Address Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin size={15} className="text-indigo-500" /> Manzillarim
            </h3>
            <button
              onClick={() => setAddAddressSheet(true)}
              className="text-xs text-indigo-600 font-medium flex items-center gap-1"
            >
              <Plus size={13} /> Qo'shish
            </button>
          </div>
          {(!currentUser?.addresses || currentUser.addresses.length === 0) ? (
            <div className="px-4 py-5 text-center">
              <p className="text-2xl mb-2">📍</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manzil qo'shilmagan</p>
              <button onClick={() => setAddAddressSheet(true)} className="mt-2 text-xs text-indigo-600 font-medium">
                + Manzil qo'shish
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {currentUser.addresses.map(addr => (
                <div key={addr.id} className="flex items-start gap-3 px-4 py-3">
                  <MapPin size={15} className={`mt-0.5 flex-shrink-0 ${addr.isDefault ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{addr.title}</p>
                      {addr.isDefault && <Badge color="indigo" size="sm">Asosiy</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{addr.address}</p>
                  </div>
                  <div className="flex gap-2">
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-gray-400 hover:text-indigo-500">
                        <Check size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
          {[
            { icon: Package, label: 'Buyurtmalarim', tab: 'orders', color: 'text-blue-500', badge: String(currentUser?.totalOrders || 0) },
            { icon: Heart, label: 'Sevimli mahsulotlar', tab: 'home', color: 'text-red-500', badge: String(wishlist.length) },
            { icon: Bell, label: 'Bildirishnomalar', tab: 'home', color: 'text-yellow-500' },
            { icon: Star, label: 'Sharhlarim', tab: 'home', color: 'text-orange-500' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(item.tab)}
              className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
            >
              <div className={`w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center ${item.color}`}>
                <item.icon size={16} />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white text-left">{item.label}</span>
              {item.badge && parseInt(item.badge) > 0 && (
                <Badge color="indigo" size="sm">{item.badge}</Badge>
              )}
              <ChevronRight size={15} className="text-gray-300 dark:text-gray-600" />
            </button>
          ))}
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-purple-500">
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Qorong'u rejim</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${darkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          {[
            { icon: HelpCircle, label: 'Yordam', color: 'text-green-500' },
            { icon: Info, label: 'Ilova haqida', color: 'text-blue-500' },
            { icon: Shield, label: 'Maxfiylik siyosati', color: 'text-gray-500' },
          ].map((item, i) => (
            <button
              key={i}
              className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
            >
              <div className={`w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center ${item.color}`}>
                <item.icon size={16} />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white text-left">{item.label}</span>
              <ChevronRight size={15} className="text-gray-300 dark:text-gray-600" />
            </button>
          ))}
        </div>

        {/* App Version */}
        <div className="text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">Oila Market v2.0.0 © 2024</p>
        </div>
      </div>

      {/* Edit Profile Sheet */}
      <BottomSheet isOpen={editSheet} onClose={() => setEditSheet(false)} title="✏️ Profilni tahrirlash">
        <div className="p-4 space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                {currentUser?.photo ? (
                  <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : <span className="text-3xl">{editName.charAt(0) || '👤'}</span>}
              </div>
              <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                <Camera size={12} />
              </button>
            </div>
          </div>
          <Input label="Ism" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Ismingiz" icon={<User size={15} />} />
          <Input label="Telefon" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+998 90 123 45 67" type="tel" icon={<Phone size={15} />} />
          <Button variant="primary" fullWidth loading={saving} onClick={handleSaveProfile}>
            Saqlash
          </Button>
        </div>
      </BottomSheet>

      {/* Add Address Sheet */}
      <BottomSheet isOpen={addAddressSheet} onClose={() => setAddAddressSheet(false)} title="📍 Manzil qo'shish">
        <div className="p-4 space-y-4">
          <Input
            label="Manzil nomi"
            value={newAddrTitle}
            onChange={(e) => setNewAddrTitle(e.target.value)}
            placeholder="Uy, Ish, Boshqa..."
          />
          <Textarea
            label="To'liq manzil"
            value={newAddr}
            onChange={(e) => setNewAddr(e.target.value)}
            placeholder="Ko'cha, uy raqami, kirish, kvartira..."
            rows={3}
          />
          <Button variant="primary" fullWidth onClick={handleAddAddress}>
            Manzil saqlash
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};
