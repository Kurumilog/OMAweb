import React, { useState, useMemo, useEffect } from 'react';
import {
  Button,
  Disclosure,
  TabProvider,
  TabList,
  Tab,
  TabPanel,
} from '@gravity-ui/uikit';
import {
  Star,
  StarFill,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  CircleCheck,
  Sparkles,
} from '@gravity-ui/icons';
import { Product, Service } from '../types';
import productsData from '../data/products.json';
import servicesData from '../data/services.json';
import { useCart } from '../context/CartContext';
import { calculateBonusPoints, formatBYN, BONUS_RATE_GOODS, BONUS_RATE_SERVICE } from '../config/loyalty';
import { ProductCard } from './ProductCard';
import { DateTimeDrawer } from './DateTimeDrawer';

const allProducts = productsData as Product[];
const allServices = servicesData as Service[];

interface ProductPageProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onStartMasterFlow?: (product: Product) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  onBack,
  onSelectProduct,
  onStartMasterFlow,
}) => {
  const { addToCart, addBundle } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [mode, setMode] = useState<'product' | 'install'>(product.installable ? 'install' : 'product');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'reviews'>('specs');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState<{ date: string; timeSlot: string; address: string } | null>(null);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Reset state when switching to a different product
  useEffect(() => {
    setQuantity(1);
    setMode(product.installable ? 'install' : 'product');
    setSelectedImageIndex(0);
    setActiveTab('specs');
    setScheduledDateTime(null);
    setAddedNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id, product.installable]);

  const service = useMemo(() => {
    if (product.serviceId) {
      return allServices.find((s) => s.id === product.serviceId) || allServices[0];
    }
    if (product.installable) {
      return allServices[0];
    }
    return null;
  }, [product]);

  // Gallery of 4 angle images (fallback to main product.image)
  const galleryImages = useMemo(() => {
    if (product.gallery && product.gallery.length > 1) {
      return product.gallery.slice(0, 4);
    }
    return [
      product.image,
      product.image,
      product.image,
      product.image,
    ];
  }, [product]);

  // Complementary goods for "С этим берут"
  const complementaryBundle = useMemo(() => {
    const list: Product[] = [];
    if (product.relatedIds && product.relatedIds.length > 0) {
      for (const id of product.relatedIds) {
        const found = allProducts.find((p) => p.id === id);
        if (found) list.push(found);
      }
    }
    if (list.length < 2) {
      const candidates = allProducts.filter((p) => p.id !== product.id && p.category === product.category);
      for (const c of candidates) {
        if (list.length >= 2) break;
        if (!list.some((item) => item.id === c.id)) list.push(c);
      }
    }
    return list.slice(0, 2);
  }, [product]);

  // 4 Related products for bottom grid
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.id !== product.id && (p.category === product.category || p.subCategory === product.subCategory))
      .slice(0, 4);
  }, [product]);

  // Calculations
  const isWithInstallation = mode === 'install' && Boolean(service);
  const servicePrice = isWithInstallation && service ? service.price : 0;
  const productTotalPrice = product.price * quantity;
  const grandTotalPrice = productTotalPrice + servicePrice;
  const productBonuses = calculateBonusPoints(productTotalPrice);
  const serviceBonuses = isWithInstallation ? Math.round(servicePrice * BONUS_RATE_SERVICE) : 0;

  const hasDiscount = Boolean(product.oldPrice && product.oldPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 13;

  const handleAddToCart = () => {
    addToCart(product, quantity, isWithInstallation);
    setAddedNotice('В корзине');
    setTimeout(() => setAddedNotice(null), 2500);
  };

  const handleAddBundle = () => {
    const bundleItems = [
      { product, qty: 1, withInstallation: isWithInstallation },
      ...complementaryBundle.map((item) => ({ product: item, qty: 1, withInstallation: false })),
    ];
    addBundle(bundleItems);
    setAddedNotice('Комплект в корзине');
    setTimeout(() => setAddedNotice(null), 2500);
  };

  const handleScheduleConfirm = (date: string, timeSlot: string, address: string) => {
    setScheduledDateTime({ date, timeSlot, address });
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center justify-between text-xs text-oma-text-secondary">
        <div className="flex items-center space-x-1.5 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-oma-blue transition-colors cursor-pointer"
          >
            Главная
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={onBack}
            className="hover:text-oma-blue transition-colors cursor-pointer"
          >
            Каталог
          </button>
          <span>/</span>
          <span>{product.subCategory || product.category}</span>
          <span>/</span>
          <span className="text-oma-text font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* 2. Intro Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-oma-text leading-tight">
          {product.name}
        </h1>
      </div>

      {/* 3. Main 3-Column Block: Gallery (472px) / Info (480px) / Purchase Panel (360px) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery (approx 472px) */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-oma-border flex items-center justify-center aspect-square shadow-sm overflow-hidden">
            <img
              src={galleryImages[selectedImageIndex] || product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-200 hover:scale-105"
            />
          </div>

          {/* 4 Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {galleryImages.map((img, idx) => {
              const isSelected = selectedImageIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`h-20 sm:h-24 rounded-2xl bg-white border p-2 flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-oma-blue ring-2 ring-oma-blue/20'
                      : 'border-oma-border hover:border-oma-text-secondary'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Ракурс ${idx + 1}`}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Information (approx 480px) */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-6">
          {/* Brand & Reviews */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-oma-text-tertiary">
              {product.brand} · Артикул {product.sku}
            </div>
            <div className="flex items-center space-x-2 text-sm text-oma-text-secondary">
              <div className="flex items-center text-amber-500">
                <StarFill className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-bold text-oma-text ml-1">{product.specs?.rating || '4.9'}</span>
              </div>
              <span>·</span>
              <span className="text-oma-text-secondary hover:text-oma-blue cursor-pointer">
                24 отзыва
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-oma-text-secondary leading-relaxed">
            {product.specs?.category || product.subCategory || 'Надежный и долговечный товар'}{' '}
            от бренда <strong className="text-oma-text">{product.brand}</strong>. Высокое качество
            материалов, простота монтажа и гарантия от производителя.
          </p>

          {/* Key Parameters */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-baseline justify-between border-b border-oma-border/60 pb-1.5">
              <span className="text-oma-text-secondary">Производитель</span>
              <span className="font-medium text-oma-text">{product.brand}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-oma-border/60 pb-1.5">
              <span className="text-oma-text-secondary">Страна производства</span>
              <span className="font-medium text-oma-text">{product.specs?.origin || 'Беларусь'}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-oma-border/60 pb-1.5">
              <span className="text-oma-text-secondary">Артикул ОМА</span>
              <span className="font-medium text-oma-text">{product.sku}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-oma-border/60 pb-1.5">
              <span className="text-oma-text-secondary">Гарантия производителя</span>
              <span className="font-medium text-oma-text">
                {product.specs?.warrantyMonths || 24} месяцев
              </span>
            </div>
          </div>

          {/* Tabs: Характеристики / Описание / Отзывы */}
          <div className="pt-2">
            <TabProvider value={activeTab} onUpdate={(val) => setActiveTab(val as any)}>
              <TabList size="l">
                <Tab value="specs">Характеристики</Tab>
                <Tab value="desc">Описание</Tab>
                <Tab value="reviews">Отзывы (24)</Tab>
              </TabList>
              <div className="mt-4 text-xs text-oma-text-secondary leading-relaxed">
                <TabPanel value="specs">
                  <div className="space-y-2">
                    <p>
                      Все товары ОМА проходят обязательный входной контроль качества. В комплекте поставки
                      присутствует паспорт изделия и инструкция по монтажу на русском языке.
                    </p>
                  </div>
                </TabPanel>
                <TabPanel value="desc">
                  <p>
                    Оригинальная сертифицированная продукция с официальной гарантией.
                    Подходит для самостоятельной установки или профессионального монтажа мастером сервиса «ОМА Мастер».
                  </p>
                </TabPanel>
                <TabPanel value="reviews">
                  <div className="space-y-3">
                    <div className="p-3 bg-oma-surface-alt rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-oma-text">Андрей В.</span>
                        <span className="text-amber-500 text-xs">★★★★★</span>
                      </div>
                      <p className="text-xs text-oma-text-secondary">
                        Отличный смеситель, мастер ОМА установил за 40 минут. Всё сухо, работает плавно!
                      </p>
                    </div>
                  </div>
                </TabPanel>
              </div>
            </TabProvider>
          </div>
        </div>

        {/* Right Column: Purchase & Installation Panel (360px) */}
        <div className="lg:col-span-4 xl:col-span-4 bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-5">
          {/* Price & Discount */}
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-oma-text">
                {formatBYN(grandTotalPrice)}
              </span>
              {hasDiscount && (
                <span className="bg-[#111] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  −{discountPercent}%
                </span>
              )}
            </div>
            {product.oldPrice && (
              <div className="text-sm text-[#9a9ba1] line-through mt-0.5">
                {formatBYN(product.oldPrice * quantity + servicePrice)}
              </div>
            )}
            <div className="text-sm font-medium text-oma-blue mt-1">
              +{productBonuses + serviceBonuses} Б за покупку на карту «Баланс»
            </div>
          </div>

          {/* In Stock Badge */}
          <div>
            <span className="inline-flex items-center text-xs font-semibold text-oma-success bg-oma-success/15 px-3 py-1 rounded-full">
              В наличии в магазинах ОМА
            </span>
          </div>

          {/* Pickup & Delivery Parameters */}
          <div className="space-y-2 text-xs border-y border-oma-border py-3">
            <div className="flex items-center justify-between">
              <span className="text-oma-text-secondary">Самовывоз</span>
              <span className="font-semibold text-oma-text">Сегодня</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-oma-text-secondary">Доставка курьером</span>
              <span className="font-semibold text-oma-text">Завтра · 8 руб.</span>
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-oma-text-secondary font-medium">Количество:</span>
            <div className="flex items-center bg-[#ecedf0] rounded-xl px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-base font-bold text-oma-text hover:text-oma-blue cursor-pointer"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-bold text-oma-text">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-base font-bold text-oma-text hover:text-oma-blue cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Segmented Switcher: Только товар / С установкой */}
          {product.installable && service && (
            <div className="space-y-4 pt-1">
              <div className="flex rounded-xl bg-[#ecedf0] p-1 border border-oma-border/60">
                <button
                  type="button"
                  onClick={() => setMode('product')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    mode === 'product'
                      ? 'bg-white text-oma-text font-bold shadow-sm'
                      : 'text-oma-text-secondary hover:text-oma-text'
                  }`}
                >
                  Только товар
                </button>
                <button
                  type="button"
                  onClick={() => setMode('install')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    mode === 'install'
                      ? 'bg-oma-blue text-white font-bold shadow-sm'
                      : 'text-oma-text-secondary hover:text-oma-text'
                  }`}
                >
                  С установкой
                </button>
              </div>

              {/* Installation Details Sub-panel */}
              {isWithInstallation && (
                <div className="bg-oma-tint/60 rounded-2xl p-4 border border-oma-blue/20 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-oma-text">
                      {service.title} · {service.price} руб.
                    </h3>
                    <p className="text-xs text-oma-text-secondary mt-0.5">
                      В течение 1–3 дней · Гарантия {service.warrantyMonths} месяцев
                    </p>
                  </div>

                  {/* Disclosures: Что входит / Что не входит */}
                  <div className="space-y-1.5 pt-1">
                    <Disclosure summary={<span className="text-xs font-semibold text-oma-text">Что входит</span>}>
                      <ul className="text-xs text-oma-text-secondary space-y-1 pt-1.5 pl-2">
                        {service.includes.map((inc, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-oma-blue shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </Disclosure>

                    <Disclosure summary={<span className="text-xs font-semibold text-oma-text">Что не входит</span>}>
                      <ul className="text-xs text-oma-text-secondary space-y-1 pt-1.5 pl-2">
                        {service.excludes.map((exc, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-oma-text-tertiary">✕</span>
                            <span>{exc}</span>
                          </li>
                        ))}
                      </ul>
                    </Disclosure>
                  </div>

                  <div className="text-xs text-oma-blue font-medium">
                    +{serviceBonuses} Б за услугу
                  </div>

                  {/* Links: Выбрать дату и время / Нужен замер */}
                  <div className="pt-2 border-t border-oma-blue/20 flex flex-col gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      className="text-left font-semibold text-oma-blue hover:underline cursor-pointer flex items-center justify-between"
                    >
                      <span>
                        {scheduledDateTime
                          ? `Мастер: ${scheduledDateTime.date}, ${scheduledDateTime.timeSlot}`
                          : 'Выбрать дату и время мастера'}
                      </span>
                      <span className="text-[11px] underline">
                        {scheduledDateTime ? 'Изменить' : 'Выбрать'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onStartMasterFlow) onStartMasterFlow(product);
                      }}
                      className="text-left text-oma-text-secondary hover:text-oma-blue cursor-pointer"
                    >
                      Нужен предварительный замер?
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action CTA Button */}
          <div className="space-y-2 pt-2">
            <Button
              view="action"
              size="xl"
              width="max"
              className="!h-[52px] !rounded-xl !font-semibold !text-base"
              onClick={handleAddToCart}
            >
              {addedNotice ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {addedNotice}
                </span>
              ) : (
                `В корзину · ${formatBYN(grandTotalPrice)}`
              )}
            </Button>

            {isWithInstallation && onStartMasterFlow && (
              <Button
                view="outlined"
                size="l"
                width="max"
                className="!rounded-xl"
                onClick={() => {
                  addToCart(product, quantity, true);
                  onStartMasterFlow(product);
                }}
              >
                Оформить заявку на мастера сейчас
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Complementary Bundle ("С этим берут", 1360px) */}
      {complementaryBundle.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-oma-text">С этим берут</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Complementary Item 1 */}
            {complementaryBundle[0] && (
              <div className="space-y-3 p-4 rounded-2xl bg-oma-bg border border-oma-border/60">
                <h3 className="text-base font-semibold text-oma-text line-clamp-1">
                  {complementaryBundle[0].name}
                </h3>
                <p className="text-sm text-oma-text font-bold">
                  {formatBYN(complementaryBundle[0].price)} · 1 шт.
                </p>
                <Button
                  view="normal"
                  size="m"
                  className="!rounded-xl"
                  onClick={() => addToCart(complementaryBundle[0], 1, false)}
                >
                  Добавить
                </Button>
              </div>
            )}

            {/* Complementary Item 2 */}
            {complementaryBundle[1] && (
              <div className="space-y-3 p-4 rounded-2xl bg-oma-bg border border-oma-border/60">
                <h3 className="text-base font-semibold text-oma-text line-clamp-1">
                  {complementaryBundle[1].name}
                </h3>
                <p className="text-sm text-oma-text font-bold">
                  {formatBYN(complementaryBundle[1].price)} · 1 шт.
                </p>
                <Button
                  view="normal"
                  size="m"
                  className="!rounded-xl"
                  onClick={() => addToCart(complementaryBundle[1], 1, false)}
                >
                  Добавить
                </Button>
              </div>
            )}

            {/* Bundle Action */}
            <div className="space-y-3 p-4 rounded-2xl bg-oma-tint border border-oma-blue/20">
              <h3 className="text-base font-bold text-oma-text">
                Вместе —{' '}
                {formatBYN(
                  product.price +
                    (complementaryBundle[0]?.price || 0) +
                    (complementaryBundle[1]?.price || 0) +
                    servicePrice
                )}
              </h3>
              <p className="text-xs text-oma-text-secondary">
                {product.brand}, комплектующие и профессиональный монтаж
              </p>
              <Button
                view="action"
                size="l"
                width="max"
                className="!rounded-xl !font-semibold"
                onClick={handleAddBundle}
              >
                Добавить комплект
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Installation Steps ("Как работает установка", 1360px) */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-oma-text">Как работает установка</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-oma-border shadow-sm space-y-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-oma-blue text-white font-bold text-sm">
              1
            </span>
            <h3 className="text-base font-bold text-oma-text">Покупка товара и услуги</h3>
            <p className="text-xs text-oma-text-secondary leading-relaxed">
              Выбираете товар в ОМА и добавляете установку в один клик.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-oma-border shadow-sm space-y-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-oma-blue text-white font-bold text-sm">
              2
            </span>
            <h3 className="text-base font-bold text-oma-text">Согласование времени</h3>
            <p className="text-xs text-oma-text-secondary leading-relaxed">
              Мастер связывается с вами и фиксирует удобное время визита.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-oma-border shadow-sm space-y-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-oma-blue text-white font-bold text-sm">
              3
            </span>
            <h3 className="text-base font-bold text-oma-text">Выезд мастера и работа</h3>
            <p className="text-xs text-oma-text-secondary leading-relaxed">
              Специалист приезжает с инструментом и выполняет монтаж по стандартам.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-oma-border shadow-sm space-y-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-oma-blue text-white font-bold text-sm">
              4
            </span>
            <h3 className="text-base font-bold text-oma-text">Приёмка, гарантия 12 мес.</h3>
            <p className="text-xs text-oma-text-secondary leading-relaxed">
              Вы проверяете работу, подписываете акт и получаете гарантию и бонусы.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Advantages ("Преимущества") */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-2">
          <CircleCheck className="w-5 h-5 text-oma-blue" />
          <h3 className="text-base font-bold text-oma-text">Проверенные мастера</h3>
          <p className="text-xs text-oma-text-secondary leading-relaxed">
            Все специалисты с подтверждённым опытом, паспортом и рейтингом от 4.8.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-2">
          <CircleCheck className="w-5 h-5 text-oma-blue" />
          <h3 className="text-base font-bold text-oma-text">Фиксированная цена</h3>
          <p className="text-xs text-oma-text-secondary leading-relaxed">
            Стоимость работ известна до начала монтажа и не меняется без согласования.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-2">
          <CircleCheck className="w-5 h-5 text-oma-blue" />
          <h3 className="text-base font-bold text-oma-text">Гарантия 12 месяцев</h3>
          <p className="text-xs text-oma-text-secondary leading-relaxed">
            Официальный договор, кассовый чек и гарантия сети гипермаркетов ОМА.
          </p>
        </div>
      </div>

      {/* 7. Related Products Grid ("Похожие товары") */}
      {relatedProducts.length > 0 && (
        <div className="space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold text-oma-text">Похожие товары</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}

      {/* Date & Time Selection Drawer */}
      {service && (
        <DateTimeDrawer
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          serviceTitle={service.title}
          servicePrice={service.price}
          onConfirm={handleScheduleConfirm}
        />
      )}
    </div>
  );
};
