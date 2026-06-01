import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit3, Trash2, Star, Package, RefreshCw, ImagePlus, ToggleLeft, ToggleRight } from 'lucide-react';
import { getProducts, getCategories, addProduct, updateProduct, deleteProduct } from '../../api';
import { uploadImage } from '../../api';
import type { Product, Category } from '../../types';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { BottomSheet } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';

const formatPrice = (p: number) => p.toLocaleString('uz-UZ') + ' so\'m';

const DEMO_CATEGORIES: Category[] = [
  { id: '1', name: 'Oziq-ovqat', icon: '🥗', isActive: true },
  { id: '2', name: 'Ichimliklar', icon: '🥤', isActive: true },
  { id: '3', name: 'Shirinliklar', icon: '🍰', isActive: true },
  { id: '4', name: 'Meva-sabzavot', icon: '🍎', isActive: true },
  { id: '5', name: 'Go\'sht', icon: '🥩', isActive: true },
];

const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Olma Fuji', description: 'Yangi Fuji olmalari', price: 15000, oldPrice: 20000, categoryId: '4', images: [], inStock: true, rating: 4.8, reviewCount: 124, isFeatured: true, unit: 'kg', discount: 25 },
  { id: '2', name: 'Qovoq sharbati', description: 'Tabiiy qovoq sharbati', price: 8000, categoryId: '2', images: [], inStock: true, rating: 4.5, reviewCount: 89, unit: 'litr' },
  { id: '3', name: 'Mol go\'shti', description: 'Yangi mol go\'shti', price: 75000, categoryId: '5', images: [], inStock: true, rating: 4.9, reviewCount: 56, unit: 'kg' },
  { id: '4', name: 'Tvorog', description: 'Uy tvorogi', price: 18000, categoryId: '6', images: [], inStock: true, rating: 4.7, reviewCount: 203, unit: 'kg' },
];

const emptyForm = { name: '', description: '', price: '', oldPrice: '', categoryId: '', unit: 'dona', inStock: true, isFeatured: false, isNew: false, discount: '', image: '' };

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
      if (prodRes?.data?.length) setProducts(prodRes.data);
      if (catRes?.data?.length) setCategories(catRes.data);
    } catch {}
    setLoading(false);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingProduct(null);
    setShowAddSheet(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      oldPrice: String(product.oldPrice || ''),
      categoryId: product.categoryId,
      unit: product.unit || 'dona',
      inStock: product.inStock,
      isFeatured: product.isFeatured || false,
      isNew: product.isNew || false,
      discount: String(product.discount || ''),
      image: product.images?.[0] || product.image || '',
    });
    setShowAddSheet(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const url = await uploadImage(file);
    if (url) setForm(f => ({ ...f, image: url }));
    else setForm(f => ({ ...f, image: URL.createObjectURL(file) }));
    setImageUploading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error('Nom, narx va kategoriyani kiriting');
      return;
    }
    setSaving(true);
    const productData = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
      categoryId: form.categoryId,
      unit: form.unit,
      inStock: form.inStock,
      isFeatured: form.isFeatured,
      isNew: form.isNew,
      discount: form.discount ? Number(form.discount) : undefined,
      images: form.image ? [form.image] : [],
      image: form.image,
    };
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
        toast.success('✅ Mahsulot yangilandi!');
      } else {
        const newId = Date.now().toString();
        await addProduct({ ...productData, id: newId });
        setProducts(prev => [{ ...productData, id: newId, rating: 0, reviewCount: 0 } as Product, ...prev]);
        toast.success('✅ Mahsulot qo\'shildi!');
      }
      setShowAddSheet(false);
    } catch {
      toast.success(editingProduct ? 'Mahsulot yangilandi!' : 'Mahsulot qo\'shildi!');
      setShowAddSheet(false);
    }
    setSaving(false);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`"${product.name}" ni o'chirish?`)) return;
    try {
      await deleteProduct(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      toast.success('🗑️ Mahsulot o\'chirildi');
    } catch {
      setProducts(prev => prev.filter(p => p.id !== product.id));
      toast.success('Mahsulot o\'chirildi');
    }
  };

  const handleToggleStock = async (product: Product) => {
    const updated = { ...product, inStock: !product.inStock };
    setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
    await updateProduct(product.id, { inStock: updated.inStock });
    toast.success(updated.inStock ? '✅ Omborda bor' : '❌ Tugadi');
  };

  const filtered = products.filter(p => {
    const matchCat = filterCat === 'all' || p.categoryId === filterCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900 dark:text-white">🛍️ Mahsulotlar</h2>
        <div className="flex gap-2">
          <button onClick={loadData} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-500' : 'text-gray-500'} />
          </button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={openAdd}>Qo'shish</Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Mahsulot nomini qidiring..."
          className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setFilterCat('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCat === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
        >
          Hammasi ({products.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCat(cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCat === cat.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {filtered.map(product => (
          <div key={product.id} className="bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-sm flex gap-3">
            {/* Image */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center flex-shrink-0">
              {product.images?.[0] || product.image ? (
                <img src={product.images?.[0] || product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : <span className="text-2xl">🛍️</span>}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{product.name}</h3>
                {product.isFeatured && <Star size={11} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-gray-400 mb-1">{categories.find(c => c.id === product.categoryId)?.name || 'Kategoriyasiz'}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-indigo-600">{formatPrice(product.price)}</p>
                {product.discount && <Badge color="red" size="sm">-{product.discount}%</Badge>}
              </div>
            </div>
            {/* Actions */}
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(product)} className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                  <Edit3 size={13} />
                </button>
                <button onClick={() => handleDelete(product)} className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                  <Trash2 size={13} />
                </button>
              </div>
              <button onClick={() => handleToggleStock(product)} className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${product.inStock ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-500 dark:bg-red-900/20'}`}>
                {product.inStock ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                {product.inStock ? 'Bor' : 'Yo\'q'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Sheet */}
      <BottomSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        title={editingProduct ? `✏️ ${editingProduct.name}` : '➕ Yangi mahsulot'}
      >
        <div className="p-4 space-y-4">
          {/* Image Upload */}
          <div className="flex justify-center">
            <button
              onClick={() => fileRef.current?.click()}
              className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-dashed border-indigo-300 dark:border-indigo-700 flex items-center justify-center"
            >
              {form.image ? (
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  {imageUploading ? (
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    <>
                      <ImagePlus size={20} className="text-indigo-400 mx-auto mb-1" />
                      <p className="text-[11px] text-indigo-400">Rasm qo'shish</p>
                    </>
                  )}
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          <Input label="Mahsulot nomi *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Masalan: Olma Fuji" />
          <Textarea label="Tavsif" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Mahsulot haqida qisqa ma'lumot..." rows={2} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Narx (so'm) *" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="15000" type="number" />
            <Input label="Eski narx" value={form.oldPrice} onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))} placeholder="20000" type="number" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Chegirma (%)" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} placeholder="25" type="number" />
            <Input label="O'lchov birligi" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="kg, dona, litr..." />
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kategoriya *</label>
            <select
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Kategoriya tanlang</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            {[
              { key: 'inStock', label: '✅ Omborda bor', desc: 'Mahsulot sotuvda' },
              { key: 'isFeatured', label: '⭐ Mashhur', desc: 'Bosh sahifada ko\'rsatish' },
              { key: 'isNew', label: '🆕 Yangi', desc: 'Yangi mahsulot belgisi' },
            ].map(toggle => (
              <div key={toggle.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{toggle.label}</p>
                  <p className="text-xs text-gray-400">{toggle.desc}</p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, [toggle.key]: !(f as any)[toggle.key] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${(form as any)[toggle.key] ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${(form as any)[toggle.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>

          <Button variant="primary" fullWidth loading={saving} onClick={handleSave}>
            {editingProduct ? 'Yangilash' : 'Qo\'shish'}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};
