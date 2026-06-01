import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, Plus, Minus } from 'lucide-react';
import { useStore } from '../../store';
import type { Product } from '../../types';
import { cn } from '../../utils/cn';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'vertical' | 'horizontal';
  onPress?: () => void;
}

const formatPrice = (p: number) => p.toLocaleString('uz-UZ') + ' so\'m';

export const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid', onPress }) => {
  const { addToCart, removeFromCart, updateCartItem, cart, toggleWishlist, isWishlisted, setActiveTab } = useStore();
  const cartItem = cart.find(i => i.product.id === product.id);
  const inCart = !!cartItem;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCartItem(product.id, (cartItem?.quantity || 0) + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newQty = (cartItem?.quantity || 1) - 1;
    updateCartItem(product.id, newQty);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  if (layout === 'horizontal') {
    return (
      <div
        className="flex gap-3 bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={onPress}
      >
        {/* Image */}
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          {product.images?.[0] || product.image ? (
            <img src={product.images?.[0] || product.image} alt={product.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span className="text-3xl">🛍️</span>
          )}
          {product.discount && (
            <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{product.name}</h3>
          {product.unit && <p className="text-xs text-gray-400 dark:text-gray-500">1 {product.unit}</p>}
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={11} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs text-gray-500">{product.rating?.toFixed(1)} ({product.reviewCount})</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.oldPrice)}</span>
              )}
            </div>
            {inCart ? (
              <div className="flex items-center gap-1.5">
                <button onClick={handleDecrease} className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                  <Minus size={12} />
                </button>
                <span className="text-sm font-bold text-gray-900 dark:text-white w-4 text-center">{cartItem?.quantity}</span>
                <button onClick={handleIncrease} className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Plus size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-90 transition-transform"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group',
        layout === 'vertical' && 'w-44'
      )}
      onClick={onPress}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className={cn('flex items-center justify-center', layout === 'vertical' ? 'h-36' : 'h-32')}>
          {product.images?.[0] || product.image ? (
            <img
              src={product.images?.[0] || product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🛍️</span>
          )}
        </div>
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              NEW
            </span>
          )}
        </div>
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shadow-sm active:scale-90 transition-transform"
        >
          <Heart
            size={13}
            className={cn(wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400')}
          />
        </button>
        {/* Stock */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded-full">Tugagan</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{product.name}</h3>
        {product.unit && <p className="text-xs text-gray-400 mt-0.5">1 {product.unit}</p>}
        {product.rating && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={10} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[11px] text-gray-500">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-gray-400">({product.reviewCount})</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</p>
            {product.oldPrice && (
              <p className="text-[11px] text-gray-400 line-through">{formatPrice(product.oldPrice)}</p>
            )}
          </div>
          {product.inStock && (
            inCart ? (
              <div className="flex items-center gap-1">
                <button onClick={handleDecrease} className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center active:scale-90 transition-transform">
                  <Minus size={11} />
                </button>
                <span className="text-xs font-bold text-gray-900 dark:text-white w-4 text-center">{cartItem?.quantity}</span>
                <button onClick={handleIncrease} className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center active:scale-90 transition-transform">
                  <Plus size={11} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-90 transition-transform"
              >
                <Plus size={14} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
