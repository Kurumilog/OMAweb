import React, { useState, useMemo, useEffect } from 'react';
import { Breadcrumbs, Select, Pagination, Button } from '@gravity-ui/uikit';
import { Xmark } from '@gravity-ui/icons';
import { Product } from '../types';
import productsData from '../data/products.json';
import { CATALOG_CATEGORIES } from './SidebarCatalog';
import { ProductCard } from './ProductCard';

const products = productsData as Product[];

interface CatalogSectionProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSelectProduct: (product: Product) => void;
  maxPrice?: number;
  onClearMaxPrice?: () => void;
  selectedBrands?: string[];
  onRemoveBrand?: (brand: string) => void;
  onlyWithInstallation?: boolean;
  onToggleOnlyInstallation?: () => void;
  onResetAllFilters?: () => void;
}

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
  maxPrice,
  onClearMaxPrice,
  selectedBrands = [],
  onRemoveBrand,
  onlyWithInstallation = false,
  onToggleOnlyInstallation,
  onResetAllFilters,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<string>('popular');
  const pageSize = 8; // Сетка 4x2 по макету

  // Сброс пагинации при смене фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, maxPrice, selectedBrands, onlyWithInstallation, sortOption]);

  const currentCategoryMeta = useMemo(() => {
    return CATALOG_CATEGORIES.find((c) => c.id === selectedCategory) || CATALOG_CATEGORIES[0];
  }, [selectedCategory]);

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
      if (maxPrice !== undefined && p.price > maxPrice) {
        return false;
      }
      if (selectedBrands.length > 0) {
        if (!p.brand || !selectedBrands.includes(p.brand)) {
          return false;
        }
      }
      if (onlyWithInstallation) {
        if (!p.serviceId && !p.installable) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'discount') {
        const discA = a.oldPrice ? (a.oldPrice - a.price) : 0;
        const discB = b.oldPrice ? (b.oldPrice - b.price) : 0;
        return discB - discA;
      }
      return 0; // 'popular' по умолчанию
    });
  }, [selectedCategory, searchQuery, maxPrice, selectedBrands, onlyWithInstallation, sortOption]);

  const totalItems = filteredProducts.length;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  const hasActiveFilters = Boolean(
    maxPrice !== undefined ||
    selectedBrands.length > 0 ||
    onlyWithInstallation ||
    searchQuery
  );

  return (
    <section id="catalog-section" className="space-y-6 w-full">
      {/* 1. Хлебные крошки — Figma node 51011:80590 */}
      <Breadcrumbs>
        <Breadcrumbs.Item onClick={() => onSelectCategory('all')}>Главная</Breadcrumbs.Item>
        <Breadcrumbs.Item onClick={() => onSelectCategory('all')}>Каталог товаров</Breadcrumbs.Item>
        {selectedCategory !== 'all' && (
          <Breadcrumbs.Item>{currentCategoryMeta.title}</Breadcrumbs.Item>
        )}
      </Breadcrumbs>

      {/* 2. Заголовок раздела — Figma node 51011:80614 */}
      <div className="space-y-1">
        <h1 className="text-[28px] md:text-[32px] font-medium leading-[36px] text-[#111111]">
          {selectedCategory === 'all'
            ? searchQuery
              ? `Результаты поиска: «${searchQuery}»`
              : 'Каталог товаров'
            : currentCategoryMeta.title}
        </h1>
        <p className="text-[15px] leading-[20px] text-[#6E6E73]">
          {selectedCategory === 'all'
            ? 'Широкий ассортимент товаров для ремонта и обустройства дома с гарантией ОМА.'
            : currentCategoryMeta.description}
        </p>
      </div>

      {/* 3. Результаты и сортировка — Figma node 51011:80617 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-[#E2E4E8]">
        <span className="text-[15px] text-[#6E6E73]">
          Найдено {totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}
        </span>

        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#6E6E73]">Сортировка:</span>
          <Select
            size="m"
            value={[sortOption]}
            onUpdate={(vals) => setSortOption(vals[0] || 'popular')}
            options={[
              { value: 'popular', content: 'По популярности' },
              { value: 'price-asc', content: 'Сначала дешевле' },
              { value: 'price-desc', content: 'Сначала дороже' },
              { value: 'discount', content: 'По размеру скидки' },
            ]}
            className="w-[220px]"
          />
        </div>
      </div>

      {/* 4. Активные фильтры — Figma node 51011:80649 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {onlyWithInstallation && (
            <span
              onClick={onToggleOnlyInstallation}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF4FF] text-[#005DD6] text-[13px] font-medium cursor-pointer hover:bg-[#DCEAFF]"
            >
              <span>Можно установить</span>
              <Xmark className="w-3.5 h-3.5" />
            </span>
          )}

          {maxPrice !== undefined && onClearMaxPrice && (
            <span
              onClick={onClearMaxPrice}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECEDF0] text-[#111111] text-[13px] font-medium cursor-pointer hover:bg-[#E2E4E8]"
            >
              <span>до {maxPrice} руб.</span>
              <Xmark className="w-3.5 h-3.5" />
            </span>
          )}

          {selectedBrands.map((b) => (
            <span
              key={b}
              onClick={() => onRemoveBrand && onRemoveBrand(b)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECEDF0] text-[#111111] text-[13px] font-medium cursor-pointer hover:bg-[#E2E4E8]"
            >
              <span>{b}</span>
              <Xmark className="w-3.5 h-3.5" />
            </span>
          ))}

          {onResetAllFilters && (
            <Button
              view="flat"
              size="s"
              onClick={onResetAllFilters}
              className="!text-[13px] !text-[#005DD6]"
            >
              Сбросить все
            </Button>
          )}
        </div>
      )}

      {/* 5. Сетка товаров 4x2 — Figma node 51011:80742 */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-[24px] border border-[#E2E4E8] p-8 space-y-3">
          <p className="text-[17px] font-medium text-[#111111]">
            По заданным фильтрам товары не найдены
          </p>
          <p className="text-[13px] text-[#6E6E73]">
            Попробуйте изменить параметры фильтрации или сбросить фильтры.
          </p>
          {onResetAllFilters && (
            <Button view="normal" size="m" onClick={onResetAllFilters} className="mt-2">
              Сбросить фильтры
            </Button>
          )}
        </div>
      )}

      {/* 6. Пагинация — Figma node 51011:80998 */}
      {totalItems > pageSize && (
        <div className="pt-6 flex justify-center">
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            total={totalItems}
            onUpdate={(newPage) => {
              setCurrentPage(newPage);
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            size="l"
          />
        </div>
      )}
    </section>
  );
};

export default CatalogSection;
