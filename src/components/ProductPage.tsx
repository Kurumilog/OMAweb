import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  Wrench,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
  Plus,
  Minus,
  ArrowRight,
  PackagePlus,
} from 'lucide-react';
import { Product, Service } from '../types';
import productsData from '../data/products.json';
import servicesData from '../data/services.json';
import { useCart } from '../context/CartContext';
import { formatBYN, BONUS_RATE_GOODS, BONUS_RATE_SERVICE } from '../config/loyalty';

const allProducts = productsData as Product[];
const allServices = servicesData as Service[];

interface ProductPageProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onStartMasterFlow: (product: Product) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  onBack,
  onSelectProduct,
  onStartMasterFlow,
}) => {
  const { addToCart, addBundle } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showInstallDetails, setShowInstallDetails] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState<'none' | 'product' | 'install' | 'bundle'>('none');

  // Reset state when switching to a related product
  useEffect(() => {
    setQuantity(1);
    setShowInstallDetails(false);
    setAddedFeedback('none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const service = useMemo(() => {
    if (product.serviceId) {
      return allServices.find((s) => s.id === product.serviceId) || allServices[0];
    }
    if (product.installable) {
      return allServices[0];
    }
    return null;
  }, [product]);

  // Find 4 complementary "Обычно берут вместе" products
  const relatedProducts = useMemo(() => {
    const result: Product[] = [];
    const seen = new Set<string>([product.id]);

    // 1. From explicit relatedIds
    if (product.relatedIds && product.relatedIds.length > 0) {
      for (const rid of product.relatedIds) {
        const found = allProducts.find((p) => p.id === rid);
        if (found && !seen.has(found.id)) {
          result.push(found);
          seen.add(found.id);
        }
      }
    }

    // 2. Complementary consumables/accessories by category
    const complementaryPool = allProducts.filter((p) => {
      if (seen.has(p.id)) return false;
      if (product.category === 'santekhnika') {
        return (
          p.category === 'santekhnika' ||
          p.name.toLowerCase().includes('герметик') ||
          p.name.toLowerCase().includes('лента') ||
          p.name.toLowerCase().includes('сифон')
        );
      }
      if (product.category === 'otdelka') {
        return (
          p.name.toLowerCase().includes('грунт') ||
          p.name.toLowerCase().includes('валик') ||
          p.name.toLowerCase().includes('кисть') ||
          p.category === 'otdelka'
        );
      }
      if (product.category === 'elektrika') {
        return (
          p.name.toLowerCase().includes('ламп') ||
          p.name.toLowerCase().includes('кабел') ||
          p.name.toLowerCase().includes('розетк') ||
          p.category === 'elektrika'
        );
      }
      return p.category === product.category;
    });

    for (const item of complementaryPool) {
      if (result.length >= 4) break;
      result.push(item);
      seen.add(item.id);
    }

    return result.slice(0, 4);
  }, [product]);

  const productBonuses = Math.round(product.price * quantity * BONUS_RATE_GOODS);
  const serviceBonuses = service ? Math.round(service.price * BONUS_RATE_SERVICE) : 0;

  const triggerFeedback = (type: 'product' | 'install' | 'bundle') => {
    setAddedFeedback(type);
    setTimeout(() => setAddedFeedback('none'), 2000);
  };

  const handleAddProductOnly = () => {
    addToCart(product, quantity, false);
    triggerFeedback('product');
  };

  const handleAddWithInstallToCart = () => {
    addToCart(product, quantity, true);
    triggerFeedback('install');
  };

  const handleImmediateMasterCall = () => {
    addToCart(product, quantity, true);
    onStartMasterFlow(product);
  };

  const handleAddAllTogether = () => {
    const bundleList = [
      { product, qty: quantity, withInstallation: showInstallDetails && product.installable },
      ...relatedProducts.slice(0, 2).map((rp) => ({ product: rp, qty: 1, withInstallation: false })),
    ];
    addBundle(bundleList);
    triggerFeedback('bundle');
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Back Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-oma-text bg-white hover:bg-oma-surface-alt px-4 py-2.5 rounded-xl border border-oma-border shadow-card transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-oma-blue" />
          <span>Назад в каталог</span>
        </button>

        <div className="text-xs text-oma-text-secondary flex items-center space-x-1.5">
          <span>Каталог ОМА</span>
          <span>/</span>
          <span>{product.subCategory || product.category}</span>
          <span>/</span>
          <span className="text-oma-text font-medium">{product.brand}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-oma-border shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Product Image (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-oma-bg rounded-2xl p-8 flex items-center justify-center aspect-square border border-oma-border/60">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply"
              />
            </div>
          </div>

          {/* Right: Product Info & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Status & SKU */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="inline-flex items-center space-x-1.5 text-xs font-medium text-oma-text-secondary bg-oma-surface-alt px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-oma-blue"></span>
                  <span>В наличии в магазинах ОМА</span>
                </div>
                <span className="text-xs text-oma-text-tertiary">
                  Артикул: <strong className="text-oma-text-secondary">{product.sku}</strong>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-oma-text leading-snug mb-4">
                {product.name}
              </h1>

              {/* Price Block */}
              <div className="p-4 rounded-2xl bg-oma-bg border border-oma-border/70 mb-5">
                <div className="flex items-baseline space-x-3 mb-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-oma-text">
                    {formatBYN(product.price * quantity)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-oma-price-old line-through">
                      {formatBYN(product.oldPrice * quantity)}
                    </span>
                  )}
                </div>

                <div className="text-xs text-oma-text-secondary flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-oma-blue" />
                  <span>
                    Начислим <strong className="text-oma-text">+{productBonuses} бонусов</strong> на карту «Баланс»
                  </span>
                </div>
              </div>

              {/* Quantity & Add to Cart Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                <div className="flex items-center justify-between border border-oma-border rounded-xl bg-oma-surface-alt px-3 py-2 sm:w-36">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 text-oma-text-secondary hover:text-oma-text cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-bold text-oma-text text-center">
                    {quantity} шт.
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1.5 text-oma-text-secondary hover:text-oma-text cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddProductOnly}
                  className="flex-1 py-3.5 px-6 bg-oma-blue hover:bg-oma-blue-hover text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {addedFeedback === 'product' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Товар добавлен в корзину</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>В корзину</span>
                    </>
                  )}
                </button>
              </div>

              {/* "Установить" Button & Expandable Starting Price Block */}
              {product.installable && service && (
                <div className="pt-1">
                  {!showInstallDetails ? (
                    <button
                      type="button"
                      onClick={() => setShowInstallDetails(true)}
                      className="w-full py-3.5 px-5 bg-oma-surface-alt hover:bg-oma-border text-oma-text font-semibold text-sm rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Wrench className="w-4 h-4 text-oma-blue" />
                      <span>Установить</span>
                    </button>
                  ) : (
                    <div className="p-5 rounded-2xl bg-oma-blue-tint/70 border border-oma-blue/30 space-y-4 animate-in fade-in duration-150">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-oma-blue flex items-center space-x-1.5 mb-0.5">
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Сервис ОМА Мастер</span>
                          </div>
                          <h3 className="font-bold text-base text-oma-text">{service.title}</h3>
                        </div>
                        <div className="sm:text-right shrink-0">
                          <div className="text-lg font-extrabold text-oma-blue">
                            от {formatBYN(service.price)}
                          </div>
                          <div className="text-[11px] text-oma-text-secondary">
                            ориентир стоимости работ
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-oma-text-secondary leading-relaxed">
                        Точная стоимость согласуется в чате с мастером после фото места установки и фиксируется до оплаты.
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-oma-text-secondary py-2.5 border-y border-oma-border">
                        <span className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-oma-blue" />
                          <span>Выезд: {service.duration}</span>
                        </span>
                        <span className="flex items-center space-x-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-oma-blue" />
                          <span>Гарантия {service.warrantyMonths} мес.</span>
                        </span>
                        <span className="flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-oma-blue" />
                          <span>Бонусы: от +{serviceBonuses} Б</span>
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-oma-text">
                          Базовый состав работ:
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {service.includes.map((inc, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-oma-text-secondary flex items-center space-x-1.5"
                            >
                              <Check className="w-3.5 h-3.5 text-oma-blue shrink-0" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Two choices for multi-item cart workflow vs immediate master request */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={handleAddWithInstallToCart}
                          className="py-3 px-4 bg-white hover:bg-oma-surface-alt text-oma-text border border-oma-border font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          {addedFeedback === 'install' ? (
                            <>
                              <Check className="w-4 h-4 text-oma-blue" />
                              <span>Добавлено с установкой</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 text-oma-blue" />
                              <span>В корзину с установкой</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleImmediateMasterCall}
                          className="py-3 px-4 bg-oma-blue hover:bg-oma-blue-hover text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <span>Оформить вызов мастера сразу</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Specifications Table */}
            <div className="pt-5 border-t border-oma-border space-y-2.5 text-xs">
              <h3 className="font-bold text-sm text-oma-text mb-2">Характеристики товара</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <div className="flex justify-between py-1 border-b border-oma-border/50">
                  <span className="text-oma-text-secondary">Бренд</span>
                  <span className="font-medium text-oma-text">{product.brand}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-oma-border/50">
                  <span className="text-oma-text-secondary">Артикул ОМА</span>
                  <span className="font-medium text-oma-text">{product.sku}</span>
                </div>
                {product.specs?.origin && (
                  <div className="flex justify-between py-1 border-b border-oma-border/50">
                    <span className="text-oma-text-secondary">Страна производства</span>
                    <span className="font-medium text-oma-text">{product.specs.origin}</span>
                  </div>
                )}
                {product.specs?.warrantyMonths && (
                  <div className="flex justify-between py-1 border-b border-oma-border/50">
                    <span className="text-oma-text-secondary">Гарантия</span>
                    <span className="font-medium text-oma-text">
                      {product.specs.warrantyMonths} мес.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "Обычно берут вместе" Section */}
      {relatedProducts.length > 0 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-oma-border shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-oma-text">
                Обычно берут вместе
              </h2>
              <p className="text-xs text-oma-text-secondary mt-0.5">
                Сопутствующие товары и расходники, которые понадобятся при монтаже и использовании
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddAllTogether}
              className="px-4 py-2.5 bg-oma-surface-alt hover:bg-oma-blue hover:text-white text-oma-text text-xs font-semibold rounded-xl transition-colors flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
            >
              {addedFeedback === 'bundle' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Комплект добавлен в корзину</span>
                </>
              ) : (
                <>
                  <PackagePlus className="w-4 h-4" />
                  <span>Добавить вместе в корзину</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectProduct(rel)}
                className="group bg-oma-bg/60 hover:bg-white rounded-2xl p-3.5 border border-oma-border hover:border-oma-blue transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="aspect-square w-full rounded-xl bg-white p-3 mb-2.5 flex items-center justify-center border border-oma-border/50">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="text-[10px] font-medium uppercase text-oma-text-tertiary mb-0.5">
                    {rel.brand}
                  </div>
                  <h4 className="text-xs font-medium text-oma-text line-clamp-2 min-h-[2.2rem] mb-2 group-hover:text-oma-blue transition-colors">
                    {rel.name}
                  </h4>
                </div>

                <div>
                  <div className="font-bold text-sm text-oma-text mb-2">
                    {formatBYN(rel.price)}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(rel, 1, false);
                    }}
                    className="w-full py-2 px-2.5 bg-white hover:bg-oma-blue hover:text-white text-oma-text border border-oma-border text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>В корзину</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
