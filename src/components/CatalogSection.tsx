import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingCart,
  Wrench,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { Product } from '../types';
import productsData from '../data/products.json';
import { useCart } from '../context/CartContext';
import { formatBYN } from '../config/loyalty';
import { CATALOG_CATEGORIES } from './SidebarCatalog';

const products = productsData as Product[];

interface CatalogSectionProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSelectProduct: (product: Product) => void;
}

// Helper to map extra sidebar categories to product dataset
function matchesCategoryFilter(product: Product, categoryId: string): boolean {
  if (categoryId === 'all') return true;
  if (product.category === categoryId) return true;

  const nameLower = product.name.toLowerCase();
  const subLower = (product.subCategory || '').toLowerCase();

  if (categoryId === 'mebel') {
    return nameLower.includes('мойк') || nameLower.includes('кухн') || nameLower.includes('тумб') || subLower.includes('мойк');
  }
  if (categoryId === 'inzhenernye') {
    return nameLower.includes('полотенцесуш') || nameLower.includes('труб') || nameLower.includes('сифон') || product.category === 'santekhnika';
  }
  if (categoryId === 'dom') {
    return product.category === 'otdelka' || product.category === 'elektrika';
  }
  if (categoryId === 'sad') {
    return product.category === 'instrument' || product.category === 'stroymaterialy';
  }
  return false;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSelectProduct,
}) => {
  const { addToCart } = useCart();
  const [visibleCount, setVisibleCount] = useState(16);

  // Reset pagination when category or search changes
  useEffect(() => {
    setVisibleCount(16);
  }, [selectedCategory, searchQuery]);

  const currentCategoryMeta = useMemo(() => {
    return CATALOG_CATEGORIES.find((c) => c.id === selectedCategory) || CATALOG_CATEGORIES[0];
  }, [selectedCategory]);

  const isCategoryPage = selectedCategory !== 'all';

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!matchesCategoryFilter(p, selectedCategory)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand?.toLowerCase().includes(q);
        const matchesCat =
          p.subCategory?.toLowerCase().includes(q) ||
          p.categoryPath?.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="catalog-section">
      {/* Dedicated Category Page Header & Installation Price Block */}
      {isCategoryPage ? (
        <div className="mb-6 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-oma-border shadow-card">
            <button
              onClick={() => onSelectCategory('all')}
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-oma-text-secondary hover:text-oma-blue mb-3 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>На главную</span>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-oma-text tracking-tight">
                  {currentCategoryMeta.title}
                </h1>
                <p className="text-xs sm:text-sm text-oma-text-secondary mt-1">
                  {currentCategoryMeta.description}
                </p>
              </div>
              <span className="text-xs font-medium text-oma-text-secondary bg-oma-surface-alt px-3 py-1.5 rounded-xl self-start sm:self-auto">
                {filteredProducts.length} товаров
              </span>
            </div>

            {/* Category Installation Price Info (Only visible on Category Page!) */}
            {currentCategoryMeta.installPriceInfo && (
              <div className="mt-5 p-4 rounded-xl bg-oma-blue-tint border border-oma-blue/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-oma-blue text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-oma-text flex items-center space-x-2">
                      <span>{currentCategoryMeta.installServiceTitle}</span>
                    </div>
                    <p className="text-xs text-oma-text-secondary mt-0.5">
                      {currentCategoryMeta.installDetails}
                    </p>
                  </div>
                </div>
                <div className="sm:text-right shrink-0 pl-12 sm:pl-0">
                  <div className="text-xs text-oma-text-secondary">Стоимость установки:</div>
                  <div className="text-base font-extrabold text-oma-blue">
                    {currentCategoryMeta.installPriceInfo}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Main Page Section Header */
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-oma-text tracking-tight">
            {searchQuery.trim() ? `Результаты поиска «${searchQuery}»` : 'Популярные товары'}
          </h2>
          <span className="text-xs text-oma-text-secondary">
            {filteredProducts.length} поз.
          </span>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-oma-border">
          <p className="text-oma-text-secondary text-sm mb-3">
            По вашему запросу ничего не найдено.
          </p>
          <button
            onClick={() => onSelectCategory('all')}
            className="px-4 py-2 bg-oma-surface-alt rounded-xl text-xs font-semibold text-oma-text hover:bg-oma-border transition-colors cursor-pointer"
          >
            Вернуться ко всем товарам
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredProducts.slice(0, visibleCount).map((product) => {
            const discountPct = product.oldPrice
              ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
              : null;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group bg-white rounded-2xl p-4 border border-oma-border hover:border-oma-blue shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Clean Product Image */}
                  <div className="relative aspect-square w-full rounded-xl bg-oma-bg overflow-hidden mb-3 p-3 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
                    />

                    {discountPct && (
                      <span className="absolute top-2.5 left-2.5 bg-oma-text text-white font-semibold text-[11px] px-2 py-0.5 rounded-lg">
                        −{discountPct}%
                      </span>
                    )}
                  </div>

                  {/* Brand & SKU */}
                  <div className="flex items-center justify-between text-[11px] text-oma-text-tertiary mb-1">
                    <span className="font-medium uppercase text-oma-text-secondary">
                      {product.brand}
                    </span>
                    <span>Арт. {product.sku}</span>
                  </div>

                  {/* Product Title */}
                  <h3
                    className="text-xs sm:text-[13px] font-medium text-oma-text line-clamp-2 min-h-[2.4rem] mb-3 leading-snug group-hover:text-oma-blue transition-colors"
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                </div>

                {/* Price & Single Standard Button */}
                <div className="pt-2 border-t border-oma-border/60">
                  <div className="flex items-baseline space-x-2 mb-3">
                    <span className="text-base sm:text-lg font-bold text-oma-text">
                      {formatBYN(product.price)}
                    </span>
                    {product.oldPrice && (
                      <span className="text-xs text-oma-price-old line-through">
                        {formatBYN(product.oldPrice)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1, false);
                    }}
                    className="w-full py-2.5 px-3 bg-oma-surface-alt hover:bg-oma-blue hover:text-white text-oma-text font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>В корзину</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {visibleCount < filteredProducts.length && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 16)}
            className="px-6 py-3 bg-white hover:bg-oma-surface-alt text-oma-text font-semibold text-xs sm:text-sm rounded-xl border border-oma-border shadow-card transition-colors cursor-pointer"
          >
            Показать ещё ({filteredProducts.length - visibleCount})
          </button>
        </div>
      )}
    </section>
  );
};
