import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Wrench,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { formatBYN, formatPoints } from '../config/loyalty';
import { Product } from '../types';
import { groupCartIntoServiceChecks } from '../utils/serviceChecks';

interface CartDrawerProps {
  onOpenMaster?: (products?: Product[]) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenMaster }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    toggleInstallation,
    goodsTotal,
    servicesTotal,
    grandTotal,
    bonusesEarned,
    bonusesToSpend,
    setBonusesToSpend,
    maxBonusesAllowed,
    clearCart,
  } = useCart();

  const { user } = useUser();
  const hasMasterService = items.some((i) => Boolean(i.installService));
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'curb' | 'floor' | 'master'>(
    hasMasterService ? 'master' : 'curb'
  );
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  React.useEffect(() => {
    if (hasMasterService) {
      setDeliveryMode('master');
    }
  }, [hasMasterService]);

  if (!isCartOpen) return null;

  const checksBreakdown = groupCartIntoServiceChecks(items);
  const deliveryCost = hasMasterService ? 0 : deliveryMode === 'pickup' ? 0 : deliveryMode === 'curb' ? 12 : 24;
  const finalPayable = grandTotal + deliveryCost;

  const handleApplyMaxBonuses = () => {
    const available = Math.min(user.bonusBalance, maxBonusesAllowed);
    setBonusesToSpend(bonusesToSpend > 0 ? 0 : available);
  };

  const handleCompleteOrder = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      clearCart();
      setCheckoutSuccess(false);
      setIsCartOpen(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl border-l border-oma-border">
        {/* Header */}
        <div className="p-5 border-b border-oma-border flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <ShoppingBag className="w-5 h-5 text-oma-blue" />
            <h2 className="font-bold text-lg text-oma-text">Корзина</h2>
            <span className="text-xs bg-oma-surface-alt font-semibold px-2.5 py-0.5 rounded-full text-oma-text-secondary">
              {items.length}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-xl text-oma-text-tertiary hover:text-oma-text hover:bg-oma-surface-alt transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {checkoutSuccess ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-oma-blue-tint text-oma-blue flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-oma-text mb-2">Заказ № 849-21 принят</h3>
            <p className="text-xs text-oma-text-secondary max-w-xs mb-4">
              Товары забронированы, заявка передана мастеру ОМА. Мы позвоним за 30 минут до выезда.
            </p>
            <div className="p-3 bg-oma-bg rounded-xl text-xs text-oma-text font-medium border border-oma-border inline-flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-oma-blue" />
              <span>Начислено +{formatPoints(bonusesEarned)} на карту «Баланс»</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-oma-surface-alt text-oma-text-tertiary flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-oma-text mb-1">В корзине пока пусто</h3>
            <p className="text-xs text-oma-text-secondary max-w-xs mb-6">
              Выберите товары из каталога слева или откройте готовый сценарий ремонта.
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="px-6 py-2.5 bg-oma-blue hover:bg-oma-blue-hover text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Перейти к каталогу
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-oma-bg/50">
            {/* Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3.5 rounded-2xl border border-oma-border bg-white space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 object-contain rounded-xl bg-oma-bg p-1.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-oma-text line-clamp-2">
                        {item.product.name}
                      </h4>
                      <div className="text-[11px] text-oma-text-tertiary mt-0.5">
                        {item.product.brand} • Арт. {item.product.sku}
                      </div>
                      <div className="font-bold text-xs text-oma-text mt-1">
                        {formatBYN(item.product.price * item.quantity)}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center space-x-1 rounded-xl px-1.5 py-1 bg-oma-surface-alt shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:text-oma-text text-oma-text-secondary cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1.5 min-w-[1.2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:text-oma-text text-oma-text-secondary cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-oma-text-tertiary hover:text-oma-text p-1 cursor-pointer transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Attached Installation Toggle */}
                  {item.product.installable && (
                    <div className="pt-2.5 border-t border-oma-border/70 flex items-center justify-between text-xs">
                      <label className="flex items-center space-x-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(item.installService)}
                          onChange={() => toggleInstallation(item.product.id)}
                          className="accent-oma-blue w-4 h-4 rounded cursor-pointer"
                        />
                        <span className="font-medium text-oma-text flex items-center space-x-1">
                          <Wrench className="w-3.5 h-3.5 text-oma-blue" />
                          <span>Установка мастером ОМА</span>
                        </span>
                      </label>

                      {item.installService ? (
                        <span className="font-bold text-oma-blue text-xs">
                          +{formatBYN(item.installService.price)}
                        </span>
                      ) : (
                        <span className="text-oma-text-tertiary text-[11px]">не выбрана</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Delivery Options */}
            <div className="bg-white p-4 rounded-2xl border border-oma-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-oma-text block">
                  Способ получения
                </span>
                {hasMasterService && (
                  <span className="text-[11px] font-semibold text-[#2D8B5D] bg-[#EDF9F0] px-2 py-0.5 rounded-full border border-[#2D8B5D]/20">
                    Бесплатно с мастером
                  </span>
                )}
              </div>

              {hasMasterService ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('master')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      deliveryMode === 'master'
                        ? 'border-[#2D8B5D] bg-[#EDF9F0]/60 ring-1 ring-[#2D8B5D]'
                        : 'border-oma-border bg-white hover:bg-oma-bg'
                    }`}
                  >
                    <div className="font-semibold text-oma-text">Доставка мастером</div>
                    <div className="text-[11px] text-[#2D8B5D] font-bold">Бесплатно</div>
                    <div className="text-[10px] text-oma-text-secondary mt-1 leading-tight">
                      Мастер привезёт товар к началу работ
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMode('pickup')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      deliveryMode === 'pickup'
                        ? 'border-oma-blue bg-oma-blue-tint'
                        : 'border-oma-border bg-white hover:bg-oma-bg'
                    }`}
                  >
                    <div className="font-semibold text-oma-text">Самовывоз</div>
                    <div className="text-[11px] text-oma-blue font-medium">Бесплатно</div>
                    <div className="text-[10px] text-oma-text-secondary mt-1 leading-tight">
                      Забрать в гипермаркете ОМА
                    </div>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('pickup')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      deliveryMode === 'pickup'
                        ? 'border-oma-blue bg-oma-blue-tint'
                        : 'border-oma-border bg-white hover:bg-oma-bg'
                    }`}
                  >
                    <div className="font-semibold text-oma-text">Самовывоз</div>
                    <div className="text-[11px] text-oma-blue font-medium">0 руб.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMode('curb')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      deliveryMode === 'curb'
                        ? 'border-oma-blue bg-oma-blue-tint'
                        : 'border-oma-border bg-white hover:bg-oma-bg'
                    }`}
                  >
                    <div className="font-semibold text-oma-text">До подъезда</div>
                    <div className="text-[11px] text-oma-text-secondary">12.00 руб.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMode('floor')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      deliveryMode === 'floor'
                        ? 'border-oma-blue bg-oma-blue-tint'
                        : 'border-oma-border bg-white hover:bg-oma-bg'
                    }`}
                  >
                    <div className="font-semibold text-oma-text">С подъёмом</div>
                    <div className="text-[11px] text-oma-text-secondary">24.00 руб.</div>
                  </button>
                </div>
              )}
            </div>

            {/* Loyalty Points */}
            <div className="p-4 bg-white rounded-2xl border border-oma-border space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-oma-text">
                  <Sparkles className="w-4 h-4 text-oma-blue" />
                  <span>Программа лояльности</span>
                </div>
                <span className="text-xs text-oma-text-secondary">
                  Доступно: <strong className="text-oma-blue">{formatPoints(user.bonusBalance)}</strong>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-oma-border/60">
                <span className="text-oma-text-secondary">
                  Списать до 20% ({maxBonusesAllowed} руб.)
                </span>
                <button
                  type="button"
                  onClick={handleApplyMaxBonuses}
                  className="px-3 py-1.5 bg-oma-surface-alt hover:bg-oma-border text-xs font-semibold text-oma-text rounded-xl transition-colors cursor-pointer"
                >
                  {bonusesToSpend > 0
                    ? 'Отменить'
                    : `Списать ${Math.min(user.bonusBalance, maxBonusesAllowed)} руб.`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && !checkoutSuccess && (
          <div className="p-5 border-t border-oma-border bg-white space-y-3">
            {checksBreakdown.serviceChecks.length > 1 && (
              <div className="p-2.5 rounded-xl bg-[#EDF4FF] border border-[#005DD6]/20 space-y-1.5 text-xs">
                <div className="font-bold text-[#005DD6]">
                  Разделено на {checksBreakdown.serviceChecks.length} отдельных чека (разные услуги):
                </div>
                {checksBreakdown.serviceChecks.map((chk) => (
                  <div key={chk.service.id} className="flex items-center justify-between text-[11px] text-[#111111]">
                    <span className="truncate pr-2">
                      Чек №{chk.checkNumber}: {chk.service.title}
                    </span>
                    <span className="font-bold shrink-0">{formatBYN(chk.total)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5 text-xs text-oma-text-secondary">
              <div className="flex justify-between">
                <span>Товары</span>
                <span className="font-medium text-oma-text">{formatBYN(goodsTotal)}</span>
              </div>
              {servicesTotal > 0 && (
                <div className="flex justify-between text-oma-blue font-medium">
                  <span>Установка мастером</span>
                  <span>+{formatBYN(servicesTotal)}</span>
                </div>
              )}
              {hasMasterService ? (
                <div className="flex justify-between text-[#2D8B5D] font-medium">
                  <span>Доставка</span>
                  <span>Бесплатно мастером</span>
                </div>
              ) : deliveryCost > 0 ? (
                <div className="flex justify-between">
                  <span>Доставка</span>
                  <span>+{formatBYN(deliveryCost)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-[#2D8B5D] font-medium">
                  <span>Доставка</span>
                  <span>Бесплатно</span>
                </div>
              )}
              {bonusesToSpend > 0 && (
                <div className="flex justify-between text-oma-blue font-medium">
                  <span>Списано бонусов</span>
                  <span>−{formatBYN(bonusesToSpend)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-oma-border flex justify-between items-baseline text-sm">
                <span className="font-bold text-oma-text">Итого</span>
                <span className="text-xl font-extrabold text-oma-text">{formatBYN(finalPayable)}</span>
              </div>
              <div className="text-[11px] text-oma-text-secondary flex items-center justify-end space-x-1">
                <span>Начислим +{formatPoints(bonusesEarned)} за заказ</span>
              </div>
            </div>

            {items.some((i) => Boolean(i.installService)) && onOpenMaster && (
              <button
                type="button"
                onClick={() => {
                  const installProducts = items
                    .filter((i) => Boolean(i.installService))
                    .map((i) => i.product);
                  setIsCartOpen(false);
                  onOpenMaster(installProducts.length > 0 ? installProducts : items.map((i) => i.product));
                }}
                className="w-full py-3 bg-oma-blue-tint hover:bg-oma-blue-tint/80 text-oma-blue font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 border border-oma-blue/30 transition-colors cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-oma-blue" />
                <span>
                  Вызвать мастера ОМА ({items.filter((i) => Boolean(i.installService)).length} с установкой)
                </span>
              </button>
            )}

            <button
              onClick={handleCompleteOrder}
              className="w-full py-3.5 bg-oma-blue hover:bg-oma-blue-hover text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <span>Оформить заказ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
