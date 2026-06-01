import React, { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../../store';
import { getProducts } from '../../api';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { BottomSheet } from '../ui/Modal';

const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Olma Fuji', description: 'Yangi Fuji olmalari', price: 15000, oldPrice: 20000, categoryId: '4', images: [], inStock: true, rating: 4.8, reviewCount: 124, isFeatured: true, unit: 'kg', discount: 25 },
  { id: '2', name: 'Qovoq sharbati', description: 'Tabiiy qovoq sharbati', price: 8000, categoryId: '2', images: [], inStock: true, rating: 4.5, reviewCount: 89, unit: 'litr' },
  { id: '3', name: 'Mol go\'shti', description: 'Yangi mol go\'shti', price: 75000, categoryId: '5', images: [], inStock: true, rating: 4.9, reviewCount: 56, unit: 'kg' },
  { id: '4', name: 'Tvorog', description: 'Uy tvorogi', price: 18000, categoryId: '6', images: [], inStock: true, rating: 4.7, reviewCount: 203, unit: 'kg' },
  { id: '5', name: 'Non', description: 'Yangi pishirilgan non', price: 5000, categoryId: '7', images: [], inStock: true, rating: 4.6, reviewCount: 342, unit: 'dona', isNew: true },
  { id: '6', name: 'Shokolad tort', description: 'Belçika shokofadi bilan', price: 120000, oldPrice: 150000, categoryId: '3', images: [], inStock: true, rating: 4.9, reviewCount: 78, unit: 'kg', discount: 20 },
];

const POPULAR_SEARCHES = ['Olma', 'Non', 'Go\'sht', 'Sharbat', 'Tort', 'Sabzavot'];

export const SearchTab: React.FC = () => {
  const { searchHistory, addSearchHistory, clearSearchHistory } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'rating' | 'new'>('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query, sortBy, inStockOnly, allProducts]);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      if (res?.data?.length) setAllProducts(res.data);
    } catch {}
  };

  const performSearch = (q: string) => {
    const q_lower = q.toLowerCase();
    let filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(q_lower) ||
      p.description?.toLowerCase().includes(q_lower) ||
      p.categoryName?.toLowerCase().includes(q_lower)
    );
    if (inStockOnly) filtered = filtered.filter(p => p.inStock);
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sortBy) {
      case 'price_asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price_desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'rating': filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'new': filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
    }
    setResults(filtered);
  };

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim()) addSearchHistory(q.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) addSearchHistory(query.trim());
  };

  return (
    <div className="pb-24 min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 px-4 pt-4 pb-3 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-3">🔍 Qidiruv</h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mahsulot nomini kiriting..."
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl pl-10 pr-10 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-colors ${showFilters || sortBy !== 'default' || inStockOnly ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          >
            <SlidersHorizontal size={16} />
          </button>
        </form>
      </div>

      <div className="px-4 py-4">
        {!query ? (
          <div className="space-y-6">
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" /> Qidiruv tarixi
                  </h2>
                  <button onClick={clearSearchHistory} className="text-xs text-red-500">Tozalash</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(q)}
                      className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Clock size={12} className="text-gray-400" /> {q}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Remove single item
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={12} />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Popular Searches */}
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-3">
                <TrendingUp size={14} className="text-indigo-500" /> Mashhur qidiruvlar
              </h2>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(term)}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                  >
                    🔥 {term}
                  </button>
                ))}
              </div>
            </div>
            {/* All products preview */}
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Barcha mahsulotlar</h2>
              <div className="grid grid-cols-2 gap-3">
                {allProducts.slice(0, 6).map(p => (
                  <ProductCard key={p.id} product={p} layout="grid" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🔍</div>
                <h3 className="text-gray-900 dark:text-white font-bold text-lg">Natija topilmadi</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">"{query}" bo'yicha mahsulot yo'q</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{results.length} ta natija topildi</p>
                <div className="space-y-3">
                  {results.map(p => (
                    <ProductCard key={p.id} product={p} layout="horizontal" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Sheet */}
      <BottomSheet isOpen={showFilters} onClose={() => setShowFilters(false)} title="🎛️ Filtr va saralash">
        <div className="p-4 space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Saralash</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'default', label: 'Default' },
                { key: 'price_asc', label: '💰 Narx ↑' },
                { key: 'price_desc', label: '💰 Narx ↓' },
                { key: 'rating', label: '⭐ Reyting' },
                { key: 'new', label: '🆕 Yangi' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key as typeof sortBy)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${sortBy === opt.key ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Faqat mavjud</p>
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`relative w-12 h-6 rounded-full transition-colors ${inStockOnly ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${inStockOnly ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          <button
            onClick={() => { setSortBy('default'); setInStockOnly(false); setPriceRange([0, 500000]); setShowFilters(false); }}
            className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold"
          >
            Tozalash
          </button>
          <button
            onClick={() => setShowFilters(false)}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg"
          >
            Qo'llash
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
