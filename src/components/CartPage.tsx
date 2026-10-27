import React, { useState } from 'react';
import { Button, Checkbox, RadioGroup, TextInput } from '@gravity-ui/uikit';
import { ShoppingBag, ArrowLeft, TrashBin, Calendar, Clock, GeoPin, Check, Plus, Minus } from '@gravity-ui/icons';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { formatBYN, calculateBonusPoints } from '../config/loyalty';
import { Product } from '../types';
import productsData from '../data/products.json';
import { DateTimeDrawer } from './DateTimeDrawer';
import { AuthModal } from './AuthModal';

const allProducts = productsData as Product[];

interface CartPageProps {
  onBackToCatalog: () => void;
  onProceedToOrder: () => void;
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

  const { user, isRegistered } = useUser();

  // Delivery configuration
  const [deliveryMode, setDeliveryMode] = useState<'curb' | 'unloading' | 'floor' | 'pickup'>('curb');
  const [address, setAddress] = useState('Минск, ул. Притыцкого, 10, кв. 24');
  const [deliveryWindow, setDeliveryWindow] = useState('28 октября · 10–14');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

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

  const deliveryCost =
    deliveryMode === 'pickup' ? 0 : deliveryMode === 'curb' ? 8 : deliveryMode === 'unloading' ? 12 : 18;

  const finalPayable = Math.max(0, grandTotal + deliveryCost - bonusesToSpend);

  // Consumable recommendation item (flexible hose)
  const flexibleHose = allProducts.find(
    (p) => p.name.toLowerCase().includes('подводка') || p.id === 'p_1151026'
  ) || {
    id: 'p_hose_rec',
    sku: '1.984210',
    name: 'Гибкая подводка для воды 60 см (пара)',
    brand: 'OMA Line',
    category: 'santekhnika',
    price: 12.0,
    image: 'https://www.oma.by/upload/images/resize/products/b8/8c/2144396/350x350_in.jpg',
    inStock: true,
    installable: false,
    gallery: [],
    specs: {},
  };

  const isHoseInCart = items.some((i) => i.product.id === flexibleHose.id);

  const handleCheckout = () => {
    if (!isRegistered) {
      setIsAuthOpen(true);
      return;
    }
    onProceedToOrder();
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

  const servicesCount = items.filter((i) => Boolean(i.installService)).length;

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
          {/* Cart Items List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm space-y-6">
            {items.map((item) => {
              const productTotal = item.product.price * item.quantity;
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
                        + Добавить установку мастером сервиса «ОМА Мастер»
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Consumable Recommendation Card ("Не хватает подводки", Figma 51011:73992) */}
          {!isHoseInCart && (
            <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-3">
              <h3 className="text-lg font-bold text-oma-text">Не хватает подводки</h3>
              <p className="text-xs text-oma-text-secondary leading-relaxed">
                Для подключения сантехники и смесителей может понадобиться гибкая подводка. Рекомендуем
                уточнить длину и добавить расходные материалы заранее.
              </p>
              <div className="flex items-center justify-between p-3.5 bg-oma-bg rounded-2xl border border-oma-border/60">
                <span className="text-sm font-medium text-oma-text">
                  {flexibleHose.name} · {formatBYN(flexibleHose.price)}
                </span>
                <Button
                  view="normal"
                  size="m"
                  className="!rounded-xl"
                  onClick={() => addToCart(flexibleHose as Product, 1, false)}
                >
                  Добавить
                </Button>
              </div>
            </div>
          )}

          {/* Delivery Card (Figma 51011:74017) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm space-y-5">
            <h3 className="text-xl font-bold text-oma-text">Доставка</h3>

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
                  <GeoPin className="w-4 h-4 text-oma-blue" />
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

          {/* Loyalty "Баланс" Card (Figma 51011:74126) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-oma-text">Бонусы «Баланс»</h3>
            <p className="text-sm font-semibold text-oma-blue">
              +{bonusesEarned} Б за товары и услугу после приёмки
            </p>

            <div className="pt-1">
              <Checkbox
                checked={isSpendingBonuses}
                onUpdate={handleToggleBonusDeduction}
                size="l"
              >
                <span className="text-sm font-medium text-oma-text">
                  Списать {maxAvailableToSpend} Б · не более 20% чека
                </span>
              </Checkbox>
            </div>

            <p className="text-xs text-oma-text-secondary">
              У вас {user.bonusBalance} Б. После списания останется{' '}
              {Math.max(0, user.bonusBalance - bonusesToSpend)} Б.
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary Panel (344px) (Figma 51011:74140) */}
        <div className="lg:col-span-4 space-y-4 sticky top-6">
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
                  {deliveryCost === 0 ? 'Бесплатно' : formatBYN(deliveryCost)}
                </span>
              </div>
              {bonusesToSpend > 0 && (
                <div className="flex items-center justify-between text-oma-success">
                  <span>Бонусная скидка</span>
                  <span className="font-bold">−{formatBYN(bonusesToSpend)}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div>
              <div className="text-3xl font-extrabold text-oma-text">
                {formatBYN(finalPayable)}
              </div>
              <p className="text-sm font-semibold text-oma-blue mt-1">
                +{bonusesEarned} Б после покупки и приёмки
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
              onClick={handleCheckout}
            >
              Оформить заказ
            </Button>

            <p className="text-[11px] text-oma-text-secondary leading-relaxed text-center">
              Нажимая кнопку, вы соглашаетесь с условиями покупки и оказания услуг гипермаркетов ОМА.
            </p>
          </div>
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
