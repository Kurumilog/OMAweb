import React, { useState, useMemo } from 'react';
import { Button, Checkbox, RadioGroup, TextInput } from '@gravity-ui/uikit';
import { ShoppingBag, ArrowLeft, TrashBin, Calendar, Clock, GeoPin, House, Check, Plus, Minus, Sparkles } from '@gravity-ui/icons';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { formatBYN, calculateBonusPoints } from '../config/loyalty';
import { Product } from '../types';
import productsData from '../data/products.json';
import { DateTimeDrawer } from './DateTimeDrawer';
import { AuthModal } from './AuthModal';
import { getAdaptiveCartRecommendations } from '../utils/cartRecommendations';
import { groupCartIntoServiceChecks, resolveServiceForProduct } from '../utils/serviceChecks';

const allProducts = productsData as Product[];

interface CartPageProps {
  onBackToCatalog: () => void;
  onProceedToOrder: (targetServiceId?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onBackToCatalog,
  onProceedToOrder,
  onSelectProduct,
}) => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    toggleInstallation,
    addToCart,
    goodsTotal,
    servicesTotal,
    grandTotal,
    bonusesEarned,
    bonusesToSpend,
    setBonusesToSpend,
    maxBonusesAllowed,
  } = useCart();

  const { user, isRegistered, applyCoupon } = useUser();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const servicesCount = items.filter((i) => Boolean(i.installService)).length;
  const hasMasterService = servicesCount > 0;

  // Delivery configuration
  const [deliveryMode, setDeliveryMode] = useState<'master' | 'curb' | 'unloading' | 'floor' | 'pickup'>(
    hasMasterService ? 'master' : 'curb'
  );
  const [address, setAddress] = useState('Минск, ул. Притыцкого, 10, кв. 24');
  const [deliveryWindow, setDeliveryWindow] = useState('28 октября · 10–14');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Sync delivery mode when services in cart change
  React.useEffect(() => {
    if (hasMasterService && deliveryMode !== 'master' && deliveryMode !== 'pickup') {
      setDeliveryMode('master');
    } else if (!hasMasterService && deliveryMode === 'master') {
      setDeliveryMode('curb');
    }
  }, [hasMasterService]);

  // Attached service date/time
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedServiceItem, setSelectedServiceItem] = useState<{ productId: string; title: string; price: number } | null>(null);
  const [serviceSchedule, setServiceSchedule] = useState<{ date: string; timeSlot: string; address: string }>({
    date: '29 октября',
    timeSlot: '13–18',
    address: 'Минск, ул. Притыцкого, 10, кв. 24',
  });

  // Auth modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Bonus spend toggle
  const maxAvailableToSpend = Math.min(user.bonusBalance, maxBonusesAllowed, 10);
  const isSpendingBonuses = bonusesToSpend > 0;

  const handleToggleBonusDeduction = (checked: boolean) => {
    if (checked) {
      setBonusesToSpend(maxAvailableToSpend);
    } else {
      setBonusesToSpend(0);
    }
  };

  const deliveryCost = hasMasterService
    ? 0
    : deliveryMode === 'pickup'
      ? 0
      : deliveryMode === 'curb'
        ? 8
        : deliveryMode === 'unloading'
          ? 12
          : 18;

  // Calculate coupon discount
  const appliedCoupon = user.appliedCoupon;
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.code === 'LOGIST-30-OMA') {
      couponDiscount = Math.min(appliedCoupon.maxDiscountCap, Number((deliveryCost * 0.30).toFixed(2)));
    } else if (appliedCoupon.code === 'REPAIR-5-MID') {
      couponDiscount = Math.min(appliedCoupon.maxDiscountCap, Number((goodsTotal * 0.05).toFixed(2)));
    } else if (appliedCoupon.code === 'MASTER-10-PRO') {
      couponDiscount = Math.min(appliedCoupon.maxDiscountCap, Number((servicesTotal * 0.10).toFixed(2)));
    } else if (appliedCoupon.code === 'DECOR-8-MAX') {
      couponDiscount = Math.min(appliedCoupon.maxDiscountCap, Number((goodsTotal * 0.08).toFixed(2)));
    } else if (appliedCoupon.code === 'SEASON-10-OUTLET') {
      couponDiscount = Math.min(appliedCoupon.maxDiscountCap, Number((goodsTotal * 0.10).toFixed(2)));
    } else if (appliedCoupon.code === 'RENT-30-START') {
      couponDiscount = Math.min(appliedCoupon.maxDiscountCap, 15);
    }
  }

  const finalPayable = Math.max(0, Number((grandTotal + deliveryCost - bonusesToSpend - couponDiscount).toFixed(2)));

  // Adaptive recommendations based on actual items in the cart
  const recommendations = useMemo(() => {
    return getAdaptiveCartRecommendations(items.map((it) => it.product));
  }, [items]);

  // Separate checks grouping by distinct installation service
  const checksBreakdown = useMemo(() => {
    return groupCartIntoServiceChecks(items);
  }, [items]);

  const handleCheckout = (targetServiceId?: string) => {
    if (!isRegistered) {
      setIsAuthOpen(true);
      return;
    }
    onProceedToOrder(targetServiceId);
  };

  const handleOpenScheduleFor = (item: { product: Product; installService?: any }) => {
    if (item.installService) {
      setSelectedServiceItem({
        productId: item.product.id,
        title: item.installService.title,
        price: item.installService.price,
      });
      setIsDrawerOpen(true);
    }
  };

  const handleScheduleConfirm = (date: string, timeSlot: string, addr: string) => {
    setServiceSchedule({ date, timeSlot, address: addr });
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-oma-surface-alt flex items-center justify-center mx-auto text-oma-text-secondary">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-oma-text">Ваша корзина пуста</h2>
          <p className="text-sm text-oma-text-secondary mt-1.5">
            Выберите товары и закажите установку от проверенных мастеров сети гипермаркетов ОМА.
          </p>
        </div>
        <Button
          view="action"
          size="xl"
          className="!rounded-xl !font-semibold"
          onClick={onBackToCatalog}
        >
          Перейти в каталог
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-oma-text">Корзина</h1>
          <p className="text-base text-oma-text-secondary mt-1">
            {items.length} {items.length === 1 ? 'товар' : 'товара'} · {servicesCount}{' '}
            {servicesCount === 1 ? 'услуга' : 'услуг'} · Минск
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-oma-blue hover:underline cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Продолжить покупки в каталоге</span>
        </button>
      </div>

      {/* 2. Main Layout: Items & Options (Left) / Summary Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols / ~992px) */}
        <div className="lg:col-span-8 space-y-6">
          {checksBreakdown.hasMultipleChecks && checksBreakdown.serviceChecks.length > 0 && (
            <div className="p-4 sm:p-5 bg-[#EDF4FF] rounded-3xl border border-[#005DD6]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#005DD6]">
                  Разделение по отдельным чекам ({checksBreakdown.serviceChecks.length} усл.)
                </div>
                <p className="text-xs text-[#111111] leading-relaxed">
                  Выбранные товары относятся к разным услугам. Каждая услуга выполняется профильным мастером и оформляется в отдельном чеке со своей бесплатной доставкой мастером.
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#005DD6] border border-[#005DD6]/20 shrink-0 self-start sm:self-center">
                Разные услуги = отдельные чеки
              </span>
            </div>
          )}

          {/* Cart Items List (Grouped by Service Check when multiple services exist) */}
          {checksBreakdown.hasMultipleChecks && checksBreakdown.serviceChecks.length > 0 ? (
            <div className="space-y-6">
              {checksBreakdown.serviceChecks.map((check) => {
                const checkFinalTotal = check.isServiceActive
                  ? check.total
                  : Number((check.goodsTotal + check.service.price).toFixed(2));
                return (
                  <div
                    key={check.service.id}
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm space-y-6"
                  >
                    {/* Check Group Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-oma-border/70">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#005DD6] text-white">
                            Чек №{check.checkNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDF4FF] text-[#005DD6]">
                            {check.service.categoryLabel || 'Профильный мастер'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDF9F0] text-[#2D8B5D]">
                            Доставка мастером бесплатно
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-oma-text pt-1">
                          Услуга: {check.service.title}
                        </h3>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-xs text-oma-text-secondary">Итого по чеку №{check.checkNumber}</div>
                        <div className="text-xl font-extrabold text-oma-text">
                          {formatBYN(check.total)}
                        </div>
                      </div>
                    </div>

                    {/* Items inside this Service Check */}
                    {check.items.map((item) => {
                      const productTotal = item.product.price * item.quantity;
                      const resolvedSvc = resolveServiceForProduct(item.product);
                      return (
                        <div
                          key={item.product.id}
                          className="space-y-4 pb-6 border-b border-oma-border/70 last:border-b-0 last:pb-0"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div
                              onClick={() => onSelectProduct(item.product)}
                              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-oma-bg p-2.5 shrink-0 flex items-center justify-center border border-oma-border/60 cursor-pointer hover:border-oma-blue transition-colors"
                            >
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="max-h-full max-w-full object-contain mix-blend-multiply"
                              />
                            </div>

                            <div className="flex-1 space-y-1">
                              <div className="text-xs font-medium text-oma-text-tertiary uppercase">
                                {item.product.brand} · Арт. {item.product.sku}
                              </div>
                              <h3
                                onClick={() => onSelectProduct(item.product)}
                                className="text-base font-semibold text-oma-text hover:text-oma-blue transition-colors cursor-pointer line-clamp-2"
                              >
                                {item.product.name}
                              </h3>

                              <div className="flex items-center space-x-4 pt-2">
                                <div className="flex items-center bg-[#ecedf0] rounded-xl px-2 py-1">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                                    className="w-7 h-7 flex items-center justify-center text-sm font-bold text-oma-text hover:text-oma-blue cursor-pointer"
                                  >
                                    −
                                  </button>
                                  <span className="w-8 text-center text-sm font-bold text-oma-text">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    className="w-7 h-7 flex items-center justify-center text-sm font-bold text-oma-text hover:text-oma-blue cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.product.id)}
                                  className="px-3 py-1.5 rounded-xl bg-[#ecedf0] hover:bg-red-50 hover:text-red-600 text-xs font-medium text-oma-text transition-colors cursor-pointer"
                                >
                                  Удалить
                                </button>
                              </div>
                            </div>

                            <div className="text-right sm:self-center shrink-0">
                              <div className="text-xl font-bold text-oma-text">
                                {formatBYN(productTotal)}
                              </div>
                              {item.quantity > 1 && (
                                <div className="text-xs text-oma-text-secondary">
                                  {formatBYN(item.product.price)} / шт.
                                </div>
                              )}
                            </div>
                          </div>

                          {item.installService ? (
                            <div className="bg-oma-tint rounded-2xl p-5 border border-oma-blue/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-oma-text">
                                    {item.installService.title}
                                  </span>
                                  <span className="text-sm font-bold text-oma-blue">
                                    {formatBYN(item.installService.price)}
                                  </span>
                                </div>
                                <p className="text-xs text-oma-text-secondary flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-oma-blue shrink-0" />
                                  <span>
                                    {serviceSchedule.date} · {serviceSchedule.timeSlot} · {serviceSchedule.address}
                                  </span>
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenScheduleFor(item)}
                                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-oma-surface-alt border border-oma-border text-xs font-semibold text-oma-text transition-colors cursor-pointer"
                                >
                                  Изменить дату
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleInstallation(item.product.id)}
                                  className="px-2.5 py-2 text-xs text-oma-text-secondary hover:text-red-600 cursor-pointer"
                                  title="Отказаться от установки"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ) : item.product.installable ? (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => toggleInstallation(item.product.id)}
                                className="text-xs font-semibold text-oma-blue hover:underline cursor-pointer"
                              >
                                + Включить в чек №{check.checkNumber} установку «{resolvedSvc?.title || check.service.title}» ({formatBYN(resolvedSvc?.price || check.service.price)})
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}

                    {/* Check Footer Breakdown & Individual Checkout Action */}
                    <div className="pt-4 border-t border-oma-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F9FA] -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-5 sm:px-8 rounded-b-3xl">
                      <div className="text-xs text-oma-text-secondary space-y-0.5">
                        <div>
                          Товары чека №{check.checkNumber}: <strong className="text-oma-text">{formatBYN(check.goodsTotal)}</strong>
                          {' · '}
                          Услуга: <strong className="text-oma-blue">{formatBYN(check.isServiceActive ? check.serviceTotal : check.service.price)}</strong>
                          {' · '}
                          Доставка: <strong className="text-[#2D8B5D]">Бесплатно мастером</strong>
                        </div>
                      </div>
                      <Button
                        view="action"
                        size="l"
                        className="!rounded-xl !font-semibold shrink-0"
                        onClick={() => {
                          if (!check.isServiceActive && check.items[0]) {
                            toggleInstallation(check.items[0].product.id, check.service);
                          }
                          handleCheckout(check.service.id);
                        }}
                      >
                        Оформить чек №{check.checkNumber} · {formatBYN(checkFinalTotal)}
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Standalone Non-Installable Goods Check (if any) */}
              {checksBreakdown.standaloneGoodsItems.length > 0 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-oma-border/70">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6E6E73] text-white">
                        Отдельный чек · Товары без установки
                      </span>
                      <h3 className="text-lg font-bold text-oma-text pt-1">
                        Покупка товаров из каталога ОМА
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-oma-text-secondary">Сумма товаров</div>
                      <div className="text-xl font-extrabold text-oma-text">
                        {formatBYN(checksBreakdown.standaloneGoodsTotal)}
                      </div>
                    </div>
                  </div>

                  {checksBreakdown.standaloneGoodsItems.map((item) => {
                    const productTotal = item.product.price * item.quantity;
                    return (
                      <div
                        key={item.product.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-4 border-b border-oma-border/70 last:border-b-0 last:pb-0"
                      >
                        <div
                          onClick={() => onSelectProduct(item.product)}
                          className="w-20 h-20 rounded-2xl bg-oma-bg p-2 shrink-0 flex items-center justify-center border border-oma-border/60 cursor-pointer"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="max-h-full max-w-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="text-xs font-medium text-oma-text-tertiary uppercase">
                            {item.product.brand} · Арт. {item.product.sku}
                          </div>
                          <h3 className="text-sm font-semibold text-oma-text">{item.product.name}</h3>
                        </div>
                        <div className="text-lg font-bold text-oma-text">{formatBYN(productTotal)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm space-y-6">
              {items.map((item) => {
                const productTotal = item.product.price * item.quantity;
                const resolvedSvc = resolveServiceForProduct(item.product);
                return (
                  <div
                    key={item.product.id}
                    className="space-y-4 pb-6 border-b border-oma-border/70 last:border-b-0 last:pb-0"
                  >
                    {/* Product Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      {/* Media thumbnail */}
                      <div
                        onClick={() => onSelectProduct(item.product)}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-oma-bg p-2.5 shrink-0 flex items-center justify-center border border-oma-border/60 cursor-pointer hover:border-oma-blue transition-colors"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 space-y-1">
                        <div className="text-xs font-medium text-oma-text-tertiary uppercase">
                          {item.product.brand} · Арт. {item.product.sku}
                        </div>
                        <h3
                          onClick={() => onSelectProduct(item.product)}
                          className="text-base font-semibold text-oma-text hover:text-oma-blue transition-colors cursor-pointer line-clamp-2"
                        >
                          {item.product.name}
                        </h3>

                        {/* Stepper & Delete */}
                        <div className="flex items-center space-x-4 pt-2">
                          <div className="flex items-center bg-[#ecedf0] rounded-xl px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                              className="w-7 h-7 flex items-center justify-center text-sm font-bold text-oma-text hover:text-oma-blue cursor-pointer"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-oma-text">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-sm font-bold text-oma-text hover:text-oma-blue cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#ecedf0] hover:bg-red-50 hover:text-red-600 text-xs font-medium text-oma-text transition-colors cursor-pointer"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right sm:self-center shrink-0">
                        <div className="text-xl font-bold text-oma-text">
                          {formatBYN(productTotal)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-xs text-oma-text-secondary">
                            {formatBYN(item.product.price)} / шт.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Attached Service Card (Figma 51011:73967) */}
                    {item.installService ? (
                      <div className="bg-oma-tint rounded-2xl p-5 border border-oma-blue/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-oma-text">
                              {item.installService.title}
                            </span>
                            <span className="text-sm font-bold text-oma-blue">
                              {formatBYN(item.installService.price)}
                            </span>
                          </div>
                          <p className="text-xs text-oma-text-secondary flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-oma-blue shrink-0" />
                            <span>
                              {serviceSchedule.date} · {serviceSchedule.timeSlot} · {serviceSchedule.address}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenScheduleFor(item)}
                            className="px-3.5 py-2 rounded-xl bg-white hover:bg-oma-surface-alt border border-oma-border text-xs font-semibold text-oma-text transition-colors cursor-pointer"
                          >
                            Изменить дату
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleInstallation(item.product.id)}
                            className="px-2.5 py-2 text-xs text-oma-text-secondary hover:text-red-600 cursor-pointer"
                            title="Отказаться от установки"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : item.product.installable ? (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => toggleInstallation(item.product.id)}
                          className="text-xs font-semibold text-oma-blue hover:underline cursor-pointer"
                        >
                          + Добавить установку «{resolvedSvc?.title || 'ОМА Мастер'}» {resolvedSvc ? `(${formatBYN(resolvedSvc.price)})` : ''}
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {/* Adaptive Consumable Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-oma-blue" />
                  <h3 className="text-lg font-bold text-oma-text">Рекомендуем к вашему заказу</h3>
                </div>
                <span className="text-[11px] font-semibold text-[#005DD6] bg-[#EDF4FF] px-2.5 py-0.5 rounded-full">
                  Умный подбор ОМА
                </span>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 bg-oma-bg rounded-2xl border border-oma-border/70 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-oma-text">{rec.title}</h4>
                      <p className="text-xs text-oma-text-secondary leading-relaxed mt-0.5">
                        {rec.reason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1 flex-wrap sm:flex-nowrap">
                      <div
                        onClick={() => onSelectProduct(rec.product)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer group"
                      >
                        {rec.product.image ? (
                          <img
                            src={rec.product.image}
                            alt={rec.product.name}
                            className="w-12 h-12 rounded-xl object-contain bg-white border border-oma-border p-1 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white border border-oma-border p-1 shrink-0 flex items-center justify-center text-xs text-[#6e6e73]">
                            ОМА
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-oma-text block truncate group-hover:text-oma-blue transition-colors">
                            {rec.product.name}
                          </span>
                          <span className="text-xs font-bold text-oma-blue">
                            {formatBYN(rec.product.price)}
                          </span>
                        </div>
                      </div>

                      <Button
                        view="action"
                        size="m"
                        className="!rounded-xl !bg-[#005DD6] hover:!bg-[#004EB8] !text-white !font-medium shrink-0"
                        onClick={() => addToCart(rec.product, 1, false)}
                      >
                        + Добавить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Card (Figma 51011:74017 / Master Delivery) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-oma-text">Доставка</h3>
              {hasMasterService && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF9F0] text-[#2D8B5D] border border-[#2D8B5D]/25">
                  <Check className="w-3.5 h-3.5" />
                  Бесплатно с мастером
                </span>
              )}
            </div>

            {hasMasterService ? (
              /* MASTER DELIVERY MODULE */
              <div className="space-y-4">
                {/* Method selector: Master delivery vs Pickup */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-oma-text">Способ доставки</label>
                  <RadioGroup
                    value={deliveryMode === 'pickup' ? 'pickup' : 'master'}
                    onUpdate={(val) => setDeliveryMode(val as any)}
                    size="l"
                    direction="vertical"
                  >
                    <RadioGroup.Option value="master">
                      <div className="py-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-oma-text">
                            Доставка мастером
                          </span>
                          <span className="text-xs font-bold text-[#2D8B5D] bg-[#EDF9F0] px-2 py-0.5 rounded-full">
                            Бесплатно
                          </span>
                        </div>
                        <p className="text-xs text-[#6E6E73] mt-0.5 leading-relaxed">
                          Мастер получит товар на складе гипермаркета ОМА и привезёт его к назначенному времени монтажа прямо в квартиру.
                        </p>
                      </div>
                    </RadioGroup.Option>

                    <RadioGroup.Option value="pickup">
                      <div className="py-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-oma-text">
                            Самовывоз из гипермаркета ОМА
                          </span>
                          <span className="text-xs font-medium text-[#6E6E73]">
                            Бесплатно
                          </span>
                        </div>
                        <p className="text-xs text-[#6E6E73] mt-0.5 leading-relaxed">
                          Вы забираете товары самостоятельно в гипермаркете до приезда мастера.
                        </p>
                      </div>
                    </RadioGroup.Option>
                  </RadioGroup>
                </div>

                {/* Address Field */}
                <div className="space-y-1.5 pt-2 border-t border-oma-border/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-oma-text">Адрес проведения работ и доставки</label>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                      className="text-xs text-oma-blue hover:underline cursor-pointer font-medium"
                    >
                      {isEditingAddress ? 'Сохранить' : 'Изменить'}
                    </button>
                  </div>
                  {isEditingAddress ? (
                    <TextInput
                      value={address}
                      onUpdate={(val) => {
                        setAddress(val);
                        setServiceSchedule((prev) => ({ ...prev, address: val }));
                      }}
                      size="l"
                      className="w-full"
                    />
                  ) : (
                    <div className="p-3.5 bg-oma-surface-alt rounded-2xl border border-oma-border/60 text-sm text-oma-text flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <House className="w-4 h-4 text-oma-blue shrink-0" />
                        <span className="truncate">{address}</span>
                      </div>
                      <span className="text-xs text-[#2D8B5D] font-medium shrink-0 ml-2">Выезд подтверждён</span>
                    </div>
                  )}
                </div>

                {/* Master Appointment Date/Time */}
                <div className="space-y-1.5 pt-2 border-t border-oma-border/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-oma-text">
                      {deliveryMode === 'master'
                        ? 'Дата и время приезда мастера с товаром'
                        : 'Дата и время приезда мастера'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const firstServiceItem = items.find((i) => Boolean(i.installService));
                        if (firstServiceItem) {
                          handleOpenScheduleFor(firstServiceItem);
                        } else {
                          setIsDrawerOpen(true);
                        }
                      }}
                      className="text-xs text-oma-blue hover:underline cursor-pointer font-medium"
                    >
                      Изменить дату визита
                    </button>
                  </div>

                  <div className="p-3.5 bg-[#EDF4FF]/50 rounded-2xl border border-[#005DD6]/20 text-sm flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-[#111111] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#005DD6]" />
                        <span>{serviceSchedule.date}</span>
                        <span className="text-[#6E6E73]">·</span>
                        <Clock className="w-4 h-4 text-[#005DD6]" />
                        <span>{serviceSchedule.timeSlot}</span>
                      </div>
                      <p className="text-xs text-[#6E6E73]">
                        Мастер позвонит за 1 час до приезда
                      </p>
                    </div>
                    <span className="text-xs font-medium text-[#005DD6] bg-white px-2.5 py-1 rounded-full border border-[#005DD6]/20 shadow-2xs">
                      Согласовано
                    </span>
                  </div>
                </div>

                {/* Logistical guarantee note */}
                <div className="p-3 bg-[#F8F9FA] rounded-2xl border border-[#E2E4E8] text-xs text-[#6E6E73] flex items-center gap-2.5">
                  <span className="text-base leading-none">🚚</span>
                  <span>
                    {deliveryMode === 'master'
                      ? 'Мастер лично проверит целостность товара перед выездом со склада и занесёт его в квартиру.'
                      : 'Пожалуйста, заберите товар в гипермаркете до согласованного времени приезда мастера.'}
                  </span>
                </div>
              </div>
            ) : (
              /* STANDARD COURIER DELIVERY MODULE (NO MASTER) */
              <div className="space-y-4">
                {/* Address Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-oma-text">Адрес доставки</label>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                      className="text-xs text-oma-blue hover:underline cursor-pointer font-medium"
                    >
                      {isEditingAddress ? 'Сохранить' : 'Изменить'}
                    </button>
                  </div>
                  {isEditingAddress ? (
                    <TextInput
                      value={address}
                      onUpdate={(val) => setAddress(val)}
                      size="l"
                      className="w-full"
                    />
                  ) : (
                    <div className="p-3 bg-oma-surface-alt rounded-xl border border-oma-border/60 text-sm text-oma-text flex items-center justify-between">
                      <span>{address}</span>
                      <House className="w-4 h-4 text-oma-blue" />
                    </div>
                  )}
                </div>

                {/* Delivery Methods */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-oma-text">Способ доставки</label>
                  <RadioGroup
                    value={deliveryMode}
                    onUpdate={(val) => setDeliveryMode(val as any)}
                    size="l"
                    direction="vertical"
                  >
                    <RadioGroup.Option value="curb">
                      <span className="text-sm text-oma-text">До подъезда · 8 руб.</span>
                    </RadioGroup.Option>
                    <RadioGroup.Option value="unloading">
                      <span className="text-sm text-oma-text">С выгрузкой · 12 руб.</span>
                    </RadioGroup.Option>
                    <RadioGroup.Option value="floor">
                      <span className="text-sm text-oma-text">С подъёмом на этаж · 18 руб.</span>
                    </RadioGroup.Option>
                    <RadioGroup.Option value="pickup">
                      <span className="text-sm text-oma-text">Самовывоз из гипермаркета · Бесплатно</span>
                    </RadioGroup.Option>
                  </RadioGroup>
                </div>

                {/* Delivery Window */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-oma-text">Окно доставки</label>
                  <TextInput
                    value={deliveryWindow}
                    onUpdate={(val) => setDeliveryWindow(val)}
                    size="l"
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Loyalty 2.0 Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-oma-text">Программа лояльности ОМА 2.0</h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EDF4FF] text-[#005DD6]">
                4% кэшбэк
              </span>
            </div>

            <p className="text-sm font-semibold text-oma-blue">
              +{bonusesEarned} руб. кэшбэка за заказ после приёмки (4% товары, 3% мастер)
            </p>

            <div className="pt-1">
              <Checkbox
                checked={isSpendingBonuses}
                onUpdate={handleToggleBonusDeduction}
                size="l"
              >
                <span className="text-sm font-medium text-oma-text">
                  Списать {maxAvailableToSpend} руб. бонусов · не более 20% чека
                </span>
              </Checkbox>
            </div>

            <p className="text-xs text-oma-text-secondary">
              На счёте: {user.bonusBalance} руб. кэшбэка и {user.activityPoints ?? 6} баллов активности. После списания останется{' '}
              {Math.max(0, user.bonusBalance - bonusesToSpend)} руб. кэшбэка.
            </p>

            {/* Coupons section */}
            <div className="pt-3 border-t border-oma-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-oma-text block">
                  Купон программы активности (3 / 6 / 10 баллов)
                </label>
                {user.activityPoints && (
                  <span className="text-[11px] text-[#005DD6] font-medium">
                    {user.activityPoints} б. активности
                  </span>
                )}
              </div>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      Купон {appliedCoupon.code} применён ({appliedCoupon.discount})
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Скидка −{formatBYN(couponDiscount)} (потолок {appliedCoupon.maxDiscountCap} руб.)
                    </span>
                  </div>
                  <Button
                    view="outlined"
                    size="s"
                    onClick={() => applyCoupon(null)}
                    className="!text-xs !rounded-xl !border-emerald-300 !text-emerald-800"
                  >
                    Отменить
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {user.activeCoupons && user.activeCoupons.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {user.activeCoupons.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => applyCoupon(c.code)}
                          className="px-3 py-1.5 bg-[#F4F4F6] hover:bg-[#E2E4E8] rounded-xl text-xs font-semibold text-[#111111] transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="text-[#005DD6] font-mono">{c.code}</span>
                          <span className="text-[#6E6E73]">({c.discount})</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <TextInput
                      value={couponInput}
                      onUpdate={(val) => {
                        setCouponInput(val);
                        setCouponError(null);
                      }}
                      placeholder="Введите промокод (напр. REPAIR-5-MID)"
                      size="m"
                      className="flex-1"
                    />
                    <Button
                      view="normal"
                      size="m"
                      onClick={() => {
                        if (!couponInput.trim()) return;
                        const ok = applyCoupon(couponInput.trim());
                        if (ok) {
                          setCouponInput('');
                          setCouponError(null);
                        } else {
                          setCouponError('Купон не найден или не активен');
                        }
                      }}
                      className="!rounded-xl !font-semibold text-xs shrink-0"
                    >
                      Применить
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Panel (344px) (Figma 51011:74140) */}
        <div className="lg:col-span-4 space-y-4 sticky top-6">
          {checksBreakdown.hasMultipleChecks && checksBreakdown.serviceChecks.length > 0 ? (
            <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl font-bold text-oma-text">
                    Отдельные чеки ({checksBreakdown.serviceChecks.length})
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDF4FF] text-[#005DD6]">
                    По услугам
                  </span>
                </div>
                <p className="text-xs text-oma-text-secondary mt-1 leading-relaxed">
                  Разные услуги выполняются профильными мастерами и рассчитываются в отдельных чеках.
                </p>
              </div>

              <div className="space-y-4">
                {checksBreakdown.serviceChecks.map((check) => {
                  const checkFinalTotal = check.isServiceActive
                    ? check.total
                    : Number((check.goodsTotal + check.service.price).toFixed(2));
                  return (
                    <div
                      key={check.service.id}
                      className="p-4 rounded-2xl bg-[#F8F9FA] border border-oma-border space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#005DD6] text-white">
                          Чек №{check.checkNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-oma-text-secondary truncate">
                          {check.service.categoryLabel || 'ОМА Мастер'}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-oma-text leading-snug">
                        {check.service.title}
                      </div>

                      <div className="space-y-1.5 text-xs border-t border-b border-oma-border/70 py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-oma-text-secondary">
                            Товары ({check.items.length} поз.)
                          </span>
                          <span className="font-semibold text-oma-text">
                            {formatBYN(check.goodsTotal)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-oma-text-secondary">Услуга мастера</span>
                          <span className="font-semibold text-oma-blue">
                            {formatBYN(check.isServiceActive ? check.serviceTotal : check.service.price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-oma-text-secondary">Доставка</span>
                          <span className="text-[#2D8B5D] font-medium">Бесплатно мастером</span>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-oma-text">
                          Итого чек №{check.checkNumber}
                        </span>
                        <span className="text-lg font-extrabold text-oma-text">
                          {formatBYN(checkFinalTotal)}
                        </span>
                      </div>

                      <Button
                        view="action"
                        size="l"
                        width="max"
                        className="!rounded-xl !font-semibold !text-xs"
                        onClick={() => {
                          if (!check.isServiceActive && check.items[0]) {
                            toggleInstallation(check.items[0].product.id, check.service);
                          }
                          handleCheckout(check.service.id);
                        }}
                      >
                        Оформить чек №{check.checkNumber} · {formatBYN(checkFinalTotal)}
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-oma-border text-xs text-oma-text-secondary flex items-center justify-between">
                <span>Сумма всех {checksBreakdown.serviceChecks.length} чеков:</span>
                <span className="font-bold text-oma-text">{formatBYN(finalPayable)}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-5">
              <h2 className="text-xl font-bold text-oma-text">Ваш заказ</h2>

              {/* Cost Breakdown */}
              <div className="space-y-2.5 text-sm border-b border-oma-border pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-oma-text-secondary">Товары</span>
                  <span className="font-semibold text-oma-text">{formatBYN(goodsTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-oma-text-secondary">Услуги установки</span>
                  <span className="font-semibold text-oma-text">{formatBYN(servicesTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-oma-text-secondary">Доставка</span>
                  <span className="font-semibold text-oma-text">
                    {deliveryCost === 0 ? (
                      <span className="text-[#2D8B5D] font-medium">
                        {hasMasterService && deliveryMode === 'master' ? 'Бесплатно мастером' : 'Бесплатно'}
                      </span>
                    ) : (
                      formatBYN(deliveryCost)
                    )}
                  </span>
                </div>
                {bonusesToSpend > 0 && (
                  <div className="flex items-center justify-between text-oma-success">
                    <span>Бонусная скидка</span>
                    <span className="font-bold">−{formatBYN(bonusesToSpend)}</span>
                  </div>
                )}
                {couponDiscount > 0 && appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-600 font-medium">
                    <span>Купон ({appliedCoupon.code})</span>
                    <span className="font-bold">−{formatBYN(couponDiscount)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div>
                <div className="text-3xl font-extrabold text-oma-text">
                  {formatBYN(finalPayable)}
                </div>
                <p className="text-sm font-semibold text-oma-blue mt-1">
                  +{bonusesEarned} руб. кэшбэк на счёт после приёмки
                </p>
                <p className="text-xs text-oma-text-secondary mt-1">
                  Гарантия 12 месяцев. Бесплатная отмена услуги за 24 часа.
                </p>
              </div>

              {/* Checkout Action Button */}
              <Button
                view="action"
                size="xl"
                width="max"
                className="!h-[52px] !rounded-xl !font-semibold !text-base"
                onClick={() => handleCheckout()}
              >
                Оформить заказ
              </Button>

              <p className="text-[11px] text-oma-text-secondary leading-relaxed text-center">
                Нажимая кнопку, вы соглашаетесь с условиями покупки и оказания услуг гипермаркетов ОМА.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Block: "Что дальше" 6-step lifecycle preview (Figma 51011:74307) */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl sm:text-2xl font-bold text-oma-text">Что дальше</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { step: 1, title: 'Заказ принят', active: true },
            { step: 2, title: 'Мастер назначен', active: false },
            { step: 3, title: 'В пути', active: false },
            { step: 4, title: 'Работа выполнена', active: false },
            { step: 5, title: 'Приёмка', active: false },
            { step: 6, title: 'Отзыв', active: false },
          ].map((s) => (
            <div key={s.step} className="space-y-2">
              <div
                className={`h-1.5 rounded-full ${
                  s.active ? 'bg-oma-blue' : 'bg-oma-border'
                }`}
              />
              <p
                className={`text-xs font-medium ${
                  s.active ? 'text-oma-blue font-bold' : 'text-oma-text-secondary'
                }`}
              >
                {s.title}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-oma-text-secondary">
          Заказ принят → мастер назначен → приёмка → бонусы.
        </p>
      </div>

      {/* Date/Time Drawer for Attached Installation */}
      {selectedServiceItem && (
        <DateTimeDrawer
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          serviceTitle={selectedServiceItem.title}
          servicePrice={selectedServiceItem.price}
          onConfirm={handleScheduleConfirm}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        open={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          onProceedToOrder();
        }}
      />
    </div>
  );
};
