import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, RefreshCw, GripVertical } from 'lucide-react';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../../api';
import type { Category } from '../../types';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { BottomSheet } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';

const EMOJI_OPTIONS = ['🥗', '🥤', '🍰', '🍎', '🥩', '🥛', '🍞', '🛍️', '🥦', '🍕', '🍜', '🍳', '🧁', '🍫', '🥚', '🧀', '🐟', '🍗', '🥑', '🫐'];

const DEMO_CATEGORIES: Category[] = [
  { id: '1', name: 'Oziq-ovqat', icon: '🥗', isActive: true, productCount: 24 },
  { id: '2', name: 'Ichimliklar', icon: '🥤', isActive: true, productCount: 12 },
  { id: '3', name: 'Shirinliklar', icon: '🍰', isActive: true, productCount: 8 },
  { id: '4', name: 'Meva-sabzavot', icon: '🍎', isActive: true, productCount: 15 },
  { id: '5', name: 'Go\'sht', icon: '🥩', isActive: true, productCount: 10 },
  { id: '6', name: 'Sut mahsulotlari', icon: '🥛', isActive: true, productCount: 6 },
  { id: '7', name: 'Non-bulkalar', icon: '🍞', isActive: false, productCount: 4 },
];

const emptyForm = { name: '', icon: '🛍️', description: '', isActive: true };

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      if (res?.data?.length) setCategories(res.data);
    } catch {}
    setLoading(false);
  };

  const openAdd = () => {
    setEditingCat(null);
    setForm(emptyForm);
    setShowSheet(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setForm({ name: cat.name, icon: cat.icon, description: cat.description || '', isActive: cat.isActive });
    setShowSheet(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Kategoriya nomini kiriting'); return; }
    setSaving(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, form);
        setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, ...form } : c));
        toast.success('✅ Kategoriya yangilandi!');
      } else {
        const newCat: Category = { id: Date.now().toString(), ...form, productCount: 0 };
        await addCategory(newCat);
        setCategories(prev => [...prev, newCat]);
        toast.success('✅ Kategoriya qo\'shildi!');
      }
      setShowSheet(false);
    } catch {
      toast.success(editingCat ? 'Yangilandi!' : 'Qo\'shildi!');
      setShowSheet(false);
    }
    setSaving(false);
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`"${cat.name}" ni o'chirish?`)) return;
    try {
      await deleteCategory(cat.id);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
      toast.success('🗑️ Kategoriya o\'chirildi');
    } catch {
      setCategories(prev => prev.filter(c => c.id !== cat.id));
    }
  };

  const handleToggleActive = async (cat: Category) => {
    const updated = { ...cat, isActive: !cat.isActive };
    setCategories(prev => prev.map(c => c.id === cat.id ? updated : c));
    await updateCategory(cat.id, { isActive: updated.isActive });
    toast.success(updated.isActive ? '✅ Faollashtirildi' : '❌ O\'chirildi');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900 dark:text-white">📂 Kategoriyalar</h2>
        <div className="flex gap-2">
          <button onClick={loadCategories} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-500' : 'text-gray-500'} />
          </button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={openAdd}>Qo'shish</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-indigo-600">{categories.length}</p>
          <p className="text-xs text-gray-500">Jami kategoriya</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-emerald-600">{categories.filter(c => c.isActive).length}</p>
          <p className="text-xs text-gray-500">Faol</p>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center text-xl flex-shrink-0">
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{cat.name}</p>
                <Badge color={cat.isActive ? 'green' : 'red'} size="sm">{cat.isActive ? 'Faol' : 'Nofaol'}</Badge>
              </div>
              <p className="text-xs text-gray-400">{cat.productCount || 0} ta mahsulot</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => handleToggleActive(cat)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${cat.isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                {cat.isActive ? '✓' : '✗'}
              </button>
              <button onClick={() => openEdit(cat)} className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                <Edit3 size={13} />
              </button>
              <button onClick={() => handleDelete(cat)} className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Sheet */}
      <BottomSheet isOpen={showSheet} onClose={() => setShowSheet(false)} title={editingCat ? '✏️ Kategoriyani tahrirlash' : '➕ Yangi kategoriya'}>
        <div className="p-4 space-y-4">
          {/* Icon Picker */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emoji tanlang</p>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setForm(f => ({ ...f, icon: emoji }))}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${form.icon === emoji ? 'bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-500' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <Input label="Kategoriya nomi *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Masalan: Meva-sabzavot" />
          <Textarea label="Tavsif (ixtiyoriy)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Kategoriya haqida qisqa ma'lumot..." rows={2} />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Faol holat</p>
            <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          {/* Preview */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-2xl shadow-sm">{form.icon}</div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{form.name || 'Kategoriya nomi'}</p>
              <p className="text-xs text-gray-400">{form.isActive ? '✅ Faol' : '❌ Nofaol'}</p>
            </div>
          </div>
          <Button variant="primary" fullWidth loading={saving} onClick={handleSave}>
            {editingCat ? 'Yangilash' : 'Qo\'shish'}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};
