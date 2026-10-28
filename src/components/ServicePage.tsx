import React, { useState, useMemo, useEffect } from 'react';
import { Button, Checkbox } from '@gravity-ui/uikit';
import { Check, Sparkles, ArrowLeft } from '@gravity-ui/icons';
import { Service, Product } from '../types';
import { SHUFFLED_PRODUCTS } from '../utils/catalog';
import { formatBYN, calculateBonusPoints } from '../config/loyalty';
import { useCart } from '../context/CartContext';

const allProducts = SHUFFLED_PRODUCTS;

interface ServicePageProps {
  service: Service;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onGoToCatalog: () => void;
  onStartApplication: (
    service: Service,
    productSource: 'oma' | 'own',
    attachedProduct?: Product | null
  ) => void;
}

export const ServicePage: React.FC<ServicePageProps> = ({
  service,
  onBack,
  onSelectProduct,
  onGoToCatalog,
  onStartApplication,
}) => {
  const { addToCart } = useCart();
  const [productSource, setProductSource] = useState<'oma' | 'own'>('oma');
  const [needConsumables, setNeedConsumables] = useState<boolean>(true);

  // Relevant products for this specific service
  const matchingProducts = useMemo(() => {
    const exactMatch = allProducts.filter((p) => p.serviceId === service.id);
    if (exactMatch.length >= 3) return exactMatch.slice(0, 3);

    const categoryMap: Record<string, string[]> = {
      santekhnika: ['santekhnika'],
      sanuzel: ['santekhnika'],
      elektrika: ['elektrika'],
      otdelka: ['otdelka', 'stroymaterialy'],
      dveri: ['stroymaterialy', 'otdelka'],
      mebel: ['instrument', 'stroymaterialy'],
      tekhnika: ['santekhnika', 'elektrika'],
      prochee: ['instrument'],
    };

    const targetCats = categoryMap[service.category || 'santekhnika'] || ['santekhnika'];
    const byCategory = allProducts.filter(
      (p) =>
        exactMatch.every((em) => em.id !== p.id) &&
        targetCats.includes(p.category)
    );

    return [...exactMatch, ...byCategory].slice(0, 3);
  }, [service.id, service.category]);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(() =>
    matchingProducts[0]?.id || null
  );

  useEffect(() => {
    setSelectedProductId(matchingProducts[0]?.id || null);
  }, [matchingProducts]);

  const attachedProduct = useMemo(() => {
    if (productSource !== 'oma' || !selectedProductId) return null;
    return matchingProducts.find((p) => p.id === selectedProductId) || null;
  }, [productSource, selectedProductId, matchingProducts]);

  const consumablesPrice = needConsumables ? 14.0 : 0;
  const productPrice = attachedProduct ? attachedProduct.price : 0;
  const totalOrderPrice = service.price + productPrice + consumablesPrice;
  const serviceBonuses = Math.max(2, Math.round(service.price * (service.bonusRate || 0.05)));
  const productBonuses = attachedProduct ? calculateBonusPoints(attachedProduct.price + consumablesPrice) : 0;
  const totalBonuses = serviceBonuses + productBonuses;

  const handleProceed = () => {
    if (productSource === 'oma' && attachedProduct) {
      addToCart(attachedProduct, 1, true);
    }
    onStartApplication(service, productSource, attachedProduct);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Navigation & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6E6E73] hover:text-[#005DD6] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад к услугам</span>
        </button>
        <span className="text-[#E2E4E8]">/</span>
        <span className="text-[13px] text-[#6E6E73]">{service.categoryLabel || 'Услуга'}</span>
      </div>

      {/* 2. Hero Header: Photo, Title & Badges */}
      <div className="bg-white rounded-[24px] border border-[#E2E4E8] overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          <div className="md:col-span-5 relative min-h-[200px] sm:min-h-[230px] bg-[#F4F4F6]">
            <img
              src={service.image || `/services/${service.id}.jpg`}
              alt={service.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {service.type === 'fixed' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-[#EDF4FF] text-[#005DD6]">
                    Фиксированная цена
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-[#FFF4E5] text-[#B25E00] border border-[#FFE0B2]">
                    Цена обговаривается
                  </span>
                )}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-[#F4F4F6] text-[#6E6E73]">
                  Гарантия {service.warrantyMonths} мес.
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-[#F4F4F6] text-[#6E6E73]">
                  Время: ~{service.duration}
                </span>
              </div>

              <h1 className="text-[22px] sm:text-[28px] font-bold text-[#111111] leading-tight">
                {service.title}
              </h1>

              <p className="text-[13px] text-[#6E6E73] leading-relaxed">
                Сертифицированные мастера сети ОМА. Выезд по Минску и до 15 км от МКАД, соблюдение стандартов монтажа и фиксированная смета в акте выполненных работ.
              </p>
            </div>

            <div className="pt-2 border-t border-[#E2E4E8]/60 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[22px] font-bold text-[#111111]">
                {service.type === 'fixed' ? formatBYN(service.price) : `от ${formatBYN(service.price)}`}
                {service.unit && <span className="text-[13px] font-normal text-[#6E6E73] ml-1">/ {service.unit}</span>}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#005DD6] bg-[#EDF4FF] px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[#005DD6]" />
                +{serviceBonuses} Б на «Баланс»
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Work Scope & Materials */}
        <div className="lg:col-span-8 space-y-5">
          {/* Work Scope */}
          <div className="bg-white rounded-[20px] p-6 border border-[#E2E4E8] space-y-4">
            <h2 className="text-[18px] font-semibold text-[#111111]">
              Что входит в стоимость
            </h2>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[14px] text-[#111111]">
              {service.includes.map((inc, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EDF4FF] text-[#005DD6] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="leading-snug">{inc}</span>
                </li>
              ))}
            </ul>

            {service.excludes && service.excludes.length > 0 && (
              <div className="pt-3 border-t border-[#E2E4E8]/60 text-[12px] text-[#6E6E73]">
                <span className="font-medium text-[#111111]">Не входит в базовый тариф: </span>
                {service.excludes.join('; ')}.
              </div>
            )}
          </div>

          {/* Equipment & Consumables */}
          <div className="bg-white rounded-[20px] p-6 border border-[#E2E4E8] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-[18px] font-semibold text-[#111111]">
                Оборудование и материалы
              </h2>

              {/* Segmented Switcher */}
              <div className="grid grid-cols-2 gap-1 rounded-[12px] bg-[#ECEDF0] p-1 border border-[#E2E4E8] shrink-0 sm:w-[280px]">
                <button
                  type="button"
                  onClick={() => setProductSource('oma')}
                  className={`h-[34px] px-3 text-[13px] font-medium rounded-[8px] flex items-center justify-center transition-all cursor-pointer ${
                    productSource === 'oma'
                      ? 'bg-[#005DD6] text-white shadow-xs'
                      : 'text-[#6E6E73] hover:text-[#111111]'
                  }`}
                >
                  Купить в ОМА
                </button>
                <button
                  type="button"
                  onClick={() => setProductSource('own')}
                  className={`h-[34px] px-3 text-[13px] font-medium rounded-[8px] flex items-center justify-center transition-all cursor-pointer ${
                    productSource === 'own'
                      ? 'bg-white text-[#111111] shadow-xs'
                      : 'text-[#6E6E73] hover:text-[#111111]'
                  }`}
                >
                  Товар уже есть
                </button>
              </div>
            </div>

            {productSource === 'oma' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {matchingProducts.map((p) => {
                    const isSelected = selectedProductId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProductId(isSelected ? null : p.id)}
                        className={`rounded-[16px] p-3 border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                          isSelected
                            ? 'border-[#005DD6] bg-[#EDF4FF]/30 ring-1 ring-[#005DD6]'
                            : 'border-[#E2E4E8] bg-white hover:border-[#005DD6]/50'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="h-[90px] rounded-[10px] bg-white p-2 flex items-center justify-center border border-[#E2E4E8]/60 relative">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="max-h-full max-w-full object-contain"
                            />
                            {isSelected && (
                              <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#005DD6] text-white flex items-center justify-center text-[11px] font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#9A9BA1]">
                            {p.brand}
                          </div>
                          <p className="text-[13px] font-medium text-[#111111] line-clamp-2 leading-[17px]">
                            {p.name}
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-1.5 border-t border-[#E2E4E8]/60">
                          <div className="text-[15px] font-bold text-[#111111]">
                            {formatBYN(p.price)}
                          </div>
                          <button
                            type="button"
                            className={`w-full h-[30px] rounded-[8px] text-[12px] font-medium transition-colors ${
                              isSelected
                                ? 'bg-[#005DD6] text-white'
                                : 'bg-[#F4F4F6] text-[#111111] hover:bg-[#EDF4FF]'
                            }`}
                          >
                            {isSelected ? 'Выбран ✓' : 'Выбрать'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={onGoToCatalog}
                    className="text-[13px] font-medium text-[#005DD6] hover:underline cursor-pointer"
                  >
                    Выбрать другой товар в каталоге →
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[14px] p-4 bg-[#F4F4F6] text-[13px] text-[#6E6E73]">
                Мастер установит ваше оборудование. Перед началом работы проверит комплектацию и совместимость.
              </div>
            )}

            {/* Consumables Checkbox */}
            <div className="rounded-[14px] p-3.5 bg-[#F8FAFC] border border-[#E2E4E8] flex items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <Checkbox
                  checked={needConsumables}
                  onUpdate={(val) => setNeedConsumables(val)}
                  size="l"
                />
                <span className="text-[13px] font-medium text-[#111111]">
                  Базовые монтажные расходники мастера (герметик, прокладки, крепёж)
                </span>
              </label>
              <span className="text-[13px] font-semibold text-[#005DD6] shrink-0">
                +14,00 руб.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Order Summary */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white rounded-[20px] p-6 border border-[#E2E4E8] shadow-xs space-y-5">
            <div>
              <span className="text-[12px] text-[#6E6E73] block mb-1">Итого к оплате</span>
              <div className="text-[32px] font-bold text-[#111111] leading-none">
                {formatBYN(totalOrderPrice)}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#005DD6] bg-[#EDF4FF] px-2.5 py-1 rounded-full mt-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#005DD6]" />
                +{totalBonuses} Б начислим
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div className="space-y-2 text-[13px] border-t border-[#E2E4E8] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[#6E6E73]">Работа мастера</span>
                <span className="font-medium text-[#111111]">{formatBYN(service.price)}</span>
              </div>

              {productSource === 'oma' && attachedProduct && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#6E6E73] truncate">Товар: {attachedProduct.brand}</span>
                  <span className="font-medium text-[#111111] shrink-0">
                    {formatBYN(attachedProduct.price)}
                  </span>
                </div>
              )}

              {needConsumables && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E73]">Расходники</span>
                  <span className="font-medium text-[#111111]">{formatBYN(consumablesPrice)}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <Button
              view="action"
              size="xl"
              width="max"
              className="!h-[48px] !rounded-[12px] !bg-[#005DD6] hover:!bg-[#004EB8] !text-white !font-medium !text-[15px]"
              onClick={handleProceed}
            >
              Заказать услугу
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
