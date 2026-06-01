import React, { useEffect, useState, useRef } from 'react';
import {
  Search, ChevronRight, Star, ShoppingCart, Heart, Zap, Gift, TrendingUp, Bell, ChevronLeft
} from 'lucide-react';
import { useStore } from '../../store';
import { getProducts, getCategories, getBanners, getSettings } from '../../api';
import type { Product, Category, Banner } from '../../types';
import { ProductCard } from './ProductCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const DEMO_BANNERS: Banner[] = [
  { id: '1', title: '🔥 Yangi mahsulotlar!', subtitle: 'Chegirmalar 30% gacha', gradient: 'from-indigo-500 via-purple-500 to-pink-500', isActive: true },
  { id: '2', title: '🎁 Bepul yetkazib berish!', subtitle: '150,000 so\'mdan yuqori xaridlarda', gradient: 'from-emerald-400 via-teal-500 to-cyan-500', isActive: true },
  { id: '3', title: '⚡ Flash Sale!', subtitle: 'Bugun faqat 24 soat', gradient: 'from-orange-400 via-rose-500 to-pink-600', isActive: true },
];

const DEMO_CATEGORIES: Category[] = [
  { id: '1', name: 'Oziq-ovqat', icon: '🥗', isActive: true },
  { id: '2', name: 'Ichimliklar', icon: '🥤', isActive: true },
  { id: '3', name: 'Shirinliklar', icon: '🍰', isActive: true },
  { id: '4', name: 'Meva-sabzavot', icon: '🍎', isActive: true },
  { id: '5', name: 'Go\'sht', icon: '🥩', isActive: true },
  { id: '6', name: 'Sut mahsulotlari', icon: '🥛', isActive: true },
  { id: '7', name: 'Non-bulkalar', icon: '🍞', isActive: true },
  { id: '8', name: 'Barcha', icon: '🛍️', isActive: true },
];

const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Olma Fuji', description: 'Yangi Fuji olmalari', price: 15000, oldPrice: 20000, categoryId: '4', images: [], inStock: true, rating: 4.8, reviewCount: 124, isFeatured: true, isNew: false, unit: 'kg', discount: 25 },
  { id: '2', name: 'Qovoq sharbati', description: 'Tabiiy qovoq sharbati', price: 8000, categoryId: '2', images: [], inStock: true, rating: 4.5, reviewCount: 89, isFeatured: true, unit: 'litr' },
  { id: '3', name: 'Mol go\'shti', description: 'Yangi mol go\'shti', price: 75000, categoryId: '5', images: [], inStock: true, rating: 4.9, reviewCount: 56, isFeatured: false, unit: 'kg' },
  { id: '4', name: 'Tvorog', description: 'Uy tvorogi', price: 18000, categoryId: '6', images: [], inStock: true, rating: 4.7, reviewCount: 203, isFeatured: true, unit: 'kg' },
  { id: '5', name: 'Non', description: 'Yangi pishirilgan non', price: 5000, categoryId: '7', images: [], inStock: true, rating: 4.6, reviewCount: 342, isFeatured: false, unit: 'dona', isNew: true },
  { id: '6', name: 'Shokolad tort', description: 'Belçika shokofadi bilan', price: 120000, oldPrice: 150000, categoryId: '3', images: [], inStock: true, rating: 4.9, reviewCount: 78, isFeatured: true, unit: 'kg', discount: 20 },
];

export const HomeTab: React.FC = () => {
  const { currentUser, setActiveTab, darkMode, cartCount, unreadCount } = useStore();
  const [banners, setBanners] = useState<Banner[]>(DEMO_BANNERS);
  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(DEMO_PRODUCTS.filter(p => p.isFeatured));
  const [newProducts, setNewProducts] = useState<Product[]>(DEMO_PRODUCTS.filter(p => p.isNew));
  const [allProducts, setAllProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const cartC = cartCount();
  const notifC = unreadCount();

  useEffect(() => {
    loadData();
    const interval = setInterval(() => setCurrentBanner(c => (c + 1) % banners.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, banRes] = await Promise.all([
        getProducts(), getCategories(), getBanners()
      ]);
      if (prodRes?.data?.length) {
        setAllProducts(prodRes.data);
        setFeaturedProducts(prodRes.data.filter((p: Product) => p.isFeatured));
        setNewProducts(prodRes.data.filter((p: Product) => p.isNew));
      }
      if (catRes?.data?.length) setCategories(catRes.data);
      if (banRes?.data?.length) setBanners(banRes.data);
    } catch {}
    setLoading(false);
  };

  const filteredProducts = selectedCategory
    ? allProducts.filter(p => p.categoryId === selectedCategory)
    : allProducts;

  return (
    <div className="pb-24 min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 px-4 pt-4 pb-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Xush kelibsiz 👋</p>
            <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Oila Market 🏪
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <Bell size={18} />
              {notifC > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifC}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600"
            >
              <ShoppingCart size={18} />
              {cartC > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartC}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Search bar */}
        <button
          onClick={() => setActiveTab('search')}
          className="w-full flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Search size={16} />
          <span>Mahsulot qidiring...</span>
        </button>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Banners Slider */}
        <div className="relative overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            {banners.map((banner, i) => (
              <div
                key={banner.id}
                className={`min-w-full h-44 bg-gradient-to-br ${banner.gradient || 'from-indigo-500 to-purple-600'} p-5 flex flex-col justify-between rounded-2xl relative overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-24 h-24 bg-white rounded-full transform translate-x-8 -translate-y-8" />
                  <div className="absolute bottom-4 right-16 w-16 h-16 bg-white rounded-full" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{banner.title}</h2>
                  {banner.subtitle && <p className="text-sm text-white/80 mt-1">{banner.subtitle}</p>}
                </div>
                <button className="self-start bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">
                  Batafsil →
                </button>
              </div>
            ))}
          </div>
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBanner ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '🔥', label: 'Aksiyalar', tab: 'search', color: 'from-orange-400 to-red-500' },
            { icon: '⭐', label: 'Mashhur', tab: 'search', color: 'from-yellow-400 to-orange-500' },
            { icon: '🆕', label: 'Yangi', tab: 'search', color: 'from-emerald-400 to-teal-500' },
            { icon: '❤️', label: 'Sevimli', tab: 'profile', color: 'from-pink-400 to-rose-500' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(item.tab)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-lg shadow-sm`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Kategoriyalar</h2>
            <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-0.5">
              Hammasi <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${!selectedCategory ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 shadow-sm'}`}
            >
              🛍️ Hammasi
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${selectedCategory === cat.id ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 shadow-sm'}`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        {!selectedCategory && featuredProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Zap size={16} className="text-yellow-500" /> Mashhur mahsulotlar
              </h2>
              <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-0.5">
                Hammasi <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {featuredProducts.map(product => (
                <div key={product.id} className="flex-shrink-0 w-44">
                  <ProductCard product={product} layout="vertical" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Products */}
        {!selectedCategory && newProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp size={16} className="text-emerald-500" /> Yangi kelganlar
              </h2>
              <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-0.5">
                Hammasi <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {newProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} layout="grid" />
              ))}
            </div>
          </div>
        )}

        {/* All / Filtered Products */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Barcha mahsulotlar'}
            </h2>
            <Badge color="indigo">{filteredProducts.length} ta</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} layout="grid" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
