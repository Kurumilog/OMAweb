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
  Heart,
  HeartFill,
} from '@gravity-ui/icons';
import { Product, Service } from '../types';
import { SHUFFLED_PRODUCTS } from '../utils/catalog';
import servicesData from '../data/services.json';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { calculateBonusPoints, formatBYN, BONUS_RATE_SERVICE } from '../config/loyalty';
import { ProductCard } from './ProductCard';
import { DateTimeDrawer } from './DateTimeDrawer';

const allProducts = SHUFFLED_PRODUCTS;
const allServices = servicesData as Service[];

interface ProductPageProps {
  product: Product;
  onBack: () => void;
  onGoToCatalog?: (category?: string) => void;
  onSelectProduct: (product: Product) => void;
  onStartMasterFlow?: (product: Product) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  onBack,
  onGoToCatalog,
  onSelectProduct,
  onStartMasterFlow,
}) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useUser();
  const liked = isFavorite(product.id);
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
            onClick={() => (onGoToCatalog ? onGoToCatalog('all') : onBack())}
            className="hover:text-oma-blue transition-colors cursor-pointer"
          >
            Каталог
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => (onGoToCatalog ? onGoToCatalog(product.category) : onBack())}
            className="hover:text-oma-blue transition-colors cursor-pointer"
          >
            {product.subCategory || product.category}
          </button>
          <span>/</span>
          <span className="text-oma-text font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* 2. Intro Title */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-[#111111] leading-tight">
          {product.name}
        </h1>
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-pressed={liked}
          className={`shrink-0 h-[44px] px-4 rounded-xl border flex items-center gap-2 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            liked
              ? 'bg-[#EDF4FF] border-[#005DD6] text-[#005DD6]'
              : 'bg-white border-[#E2E4E8] text-[#111111] hover:border-[#005DD6] hover:text-[#005DD6]'
          }`}
          title={liked ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          {liked ? (
            <HeartFill className="w-4 h-4 text-[#005DD6]" />
          ) : (
            <Heart className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{liked ? 'В избранном' : 'В избранное'}</span>
        </button>
      </div>

      {/* 3. Main 3-Column Block: Gallery (472px) / Info (480px) / Purchase Panel (360px) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Gallery (approx 472px) */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4">
          <div className="relative bg-white rounded-3xl p-4 sm:p-6 border border-oma-border flex items-center justify-center aspect-square shadow-sm overflow-hidden">
            <img
              src={galleryImages[selectedImageIndex] || product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-200 hover:scale-105"
            />
            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                liked
                  ? 'bg-[#EDF4FF] text-[#005DD6] ring-1 ring-[#005DD6]/30'
                  : 'bg-white/90 hover:bg-white text-[#111111] hover:text-[#005DD6]'
              }`}
              title={liked ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              {liked ? <HeartFill className="w-5 h-5 text-[#005DD6]" /> : <Heart className="w-5 h-5" />}
            </button>
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
              +{formatBYN(Number(((productTotalPrice * 0.04) + serviceBonuses).toFixed(2)))} кэшбэк на счёт (4%)
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
              <div className="grid grid-cols-2 gap-1.5 rounded-[14px] bg-[#ECEDF0] p-1 border border-[#E2E4E8]">
                <button
                  type="button"
                  onClick={() => setMode('product')}
                  className={`h-[40px] px-3 text-[13px] font-medium rounded-[10px] flex items-center justify-center transition-all duration-200 cursor-pointer select-none ${
                    mode === 'product'
                      ? 'bg-white text-[#111111] shadow-sm ring-1 ring-[#E2E4E8]'
                      : 'text-[#6E6E73] hover:text-[#111111] hover:bg-white/60'
                  }`}
                >
                  Только товар
                </button>
                <button
                  type="button"
                  onClick={() => setMode('install')}
                  className={`h-[40px] px-3 text-[13px] font-medium rounded-[10px] flex items-center justify-center transition-all duration-200 cursor-pointer select-none ${
                    mode === 'install'
                      ? 'bg-[#005DD6] text-white shadow-sm ring-1 ring-[#005DD6]'
                      : 'text-[#6E6E73] hover:text-[#005DD6] hover:bg-[#EDF4FF]/80'
                  }`}
                >
                  С установкой
                </button>
              </div>

              {/* Installation Details Sub-panel */}
              {isWithInstallation && (
                <div className="bg-[#EDF4FF] rounded-2xl p-4 border border-[#005DD6]/20 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#111111]">
                      {service.title} · {service.price} руб.
                    </h3>
                    <p className="text-xs text-[#6E6E73] mt-0.5">
                      В течение 1–3 дней · Гарантия {service.warrantyMonths} месяцев
                    </p>
                  </div>

                  {/* Disclosures: Что входит / Что не входит */}
                  <div className="space-y-1.5 pt-1">
                    <Disclosure summary={<span className="text-xs font-semibold text-[#111111]">Что входит</span>}>
                      <ul className="text-xs text-[#6E6E73] space-y-1 pt-1.5 pl-2">
                        {service.includes.map((inc, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#005DD6] shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </Disclosure>

                    <Disclosure summary={<span className="text-xs font-semibold text-[#111111]">Что не входит</span>}>
                      <ul className="text-xs text-[#6E6E73] space-y-1 pt-1.5 pl-2">
                        {service.excludes.map((exc, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#9A9BA1]">✕</span>
                            <span>{exc}</span>
                          </li>
                        ))}
                      </ul>
                    </Disclosure>
                  </div>

                  <div className="text-xs text-[#005DD6] font-medium">
                    +{serviceBonuses} руб. кэшбэк за услугу (3%)
                  </div>

                  {/* Links: Выбрать дату и время / Нужен замер */}
                  <div className="pt-2 border-t border-[#005DD6]/20 flex flex-col gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      className="text-left font-semibold text-[#005DD6] hover:underline cursor-pointer flex items-center justify-between"
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
                      className="text-left text-[#6E6E73] hover:text-[#005DD6] cursor-pointer"
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

      {/* 4. Installation Steps & Advantages ("Как работает установка" — показывается ТОЛЬКО при выборе «С установкой») */}
      {isWithInstallation && (
        <>
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111111]">Как работает установка</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-[#E2E4E8] shadow-sm space-y-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#005DD6] text-white font-bold text-sm">
                  1
                </span>
                <h3 className="text-base font-bold text-[#111111]">Покупка товара и услуги</h3>
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  Выбираете товар в ОМА и добавляете установку в один клик.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-[#E2E4E8] shadow-sm space-y-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#005DD6] text-white font-bold text-sm">
                  2
                </span>
                <h3 className="text-base font-bold text-[#111111]">Согласование времени</h3>
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  Мастер связывается с вами и фиксирует удобное время визита.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-[#E2E4E8] shadow-sm space-y-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#005DD6] text-white font-bold text-sm">
                  3
                </span>
                <h3 className="text-base font-bold text-[#111111]">Выезд мастера и работа</h3>
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  Специалист приезжает с инструментом и выполняет монтаж по стандартам.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-[#E2E4E8] shadow-sm space-y-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#005DD6] text-white font-bold text-sm">
                  4
                </span>
                <h3 className="text-base font-bold text-[#111111]">Приёмка, гарантия 12 мес.</h3>
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  Вы проверяете работу, подписываете акт и получаете гарантию и бонусы.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-3xl p-6 border border-[#E2E4E8] shadow-sm space-y-2">
              <CircleCheck className="w-5 h-5 text-[#005DD6]" />
              <h3 className="text-base font-bold text-[#111111]">Проверенные мастера</h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Все специалисты с подтверждённым опытом, паспортом и рейтингом от 4.8.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#E2E4E8] shadow-sm space-y-2">
              <CircleCheck className="w-5 h-5 text-[#005DD6]" />
              <h3 className="text-base font-bold text-[#111111]">Фиксированная цена</h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Стоимость работ известна до начала монтажа и не меняется без согласования.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#E2E4E8] shadow-sm space-y-2">
              <CircleCheck className="w-5 h-5 text-[#005DD6]" />
              <h3 className="text-base font-bold text-[#111111]">Гарантия 12 месяцев</h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Официальный договор, кассовый чек и гарантия сети гипермаркетов ОМА.
              </p>
            </div>
          </div>
        </>
      )}

      {/* 5. Related Products Grid ("Похожие товары") */}
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
