import React, { useState } from 'react';
import { Button, TextInput, TextArea, Checkbox } from '@gravity-ui/uikit';
import {
  ArrowLeft,
  Calendar,
  Clock,
  GeoPin,
  ShieldCheck,
  Check,
  Camera,
  TrashBin,
} from '@gravity-ui/icons';
import { Service, Product } from '../types';
import servicesData from '../data/services.json';
import { useUser } from '../context/UserContext';
import { formatBYN } from '../config/loyalty';

const allServices = servicesData as Service[];

export interface ApplicationOrderData {
  service: Service;
  productSource: 'oma' | 'own';
  productName?: string;
  quantity: number;
  needDismantle: boolean;
  address: {
    city: string;
    street: string;
    house: string;
    apt: string;
    entrance: string;
    floor: string;
    intercom: string;
  };
  date: string;
  timeSlot: string;
  photos: string[];
  material: string;
  comment: string;
  paymentMethod: 'hold' | 'after';
  useBonuses: number;
  totalPrice: number;
}

interface MasterApplicationPageProps {
  initialService?: Service | null;
  initialProduct?: Product | null;
  productSource?: 'oma' | 'own';
  onBack: () => void;
  onCompleteOrder: (order: ApplicationOrderData) => void;
}

const STEP_NAMES = [
  'Услуга',
  'Адрес',
  'Время',
  'Детали',
  'Подтверждение',
];

const TIME_SLOTS = ['10–14', '13–18', '18–22'];

const MATERIALS = ['Плитка / бетон', 'Гипсокартон', 'Кирпич', 'Дерево / брус', 'Другое'];

export const MasterApplicationPage: React.FC<MasterApplicationPageProps> = ({
  initialService,
  initialProduct,
  productSource: initialProductSource = 'oma',
  onBack,
  onCompleteOrder,
}) => {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Service
  const [service] = useState<Service>(initialService || allServices[0]);
  const [productSource, setProductSource] = useState<'oma' | 'own'>(initialProductSource);
  const [quantity, setQuantity] = useState(1);
  const [readyOnSite, setReadyOnSite] = useState(true);

  // Step 2: Address
  const [address, setAddress] = useState({
    city: 'Минск',
    street: 'ул. Притыцкого',
    house: '10',
    apt: '24',
    entrance: '2',
    floor: '4',
    intercom: '24',
  });

  // Step 3: Date & Time
  const dates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const dayName = d.toLocaleDateString('ru-RU', { weekday: 'short' });
    const dayNum = d.getDate();
    const month = d.toLocaleDateString('ru-RU', { month: 'short' });
    const fullDate = `${dayNum} ${month}`;
    return { fullDate, dayName, dayNum };
  });

  const [selectedDate, setSelectedDate] = useState(dates[1].fullDate);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [syncWithDelivery, setSyncWithDelivery] = useState(true);

  // Step 4: Details
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('Плитка / бетон');
  const [needDismantle, setNeedDismantle] = useState(false);
  const [comment, setComment] = useState('');

  // Step 5: Confirmation & Payment
  const [paymentMethod, setPaymentMethod] = useState<'hold' | 'after'>('hold');
  const [applyBonuses, setApplyBonuses] = useState(false);

  const basePrice = service.price * quantity;
  const dismantleExtra = needDismantle ? 10 : 0;
  const subtotal = basePrice + dismantleExtra;
  const bonusesAvailable = user.bonusBalance;
  const bonusDiscount = applyBonuses ? Math.min(bonusesAvailable, Math.floor(subtotal * 0.3)) : 0;
  const finalPrice = Math.max(0, subtotal - bonusDiscount);
  const earnedBonuses = Math.round(finalPrice * 0.08);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCompleteOrder({
        service,
        productSource,
        productName: initialProduct ? initialProduct.name : undefined,
        quantity,
        needDismantle,
        address,
        date: selectedDate,
        timeSlot: selectedSlot,
        photos,
        material: selectedMaterial,
        comment,
        paymentMethod,
        useBonuses: bonusDiscount,
        totalPrice: finalPrice,
      });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBack();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && photos.length < 5) {
          setPhotos([...photos, event.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header & Title */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-oma-text-secondary uppercase tracking-wider">
          OMA МАСТЕР · ОФОРМЛЕНИЕ ЗАЯВКИ
        </p>
        <h1 className="text-3xl lg:text-4xl font-medium text-oma-text-primary">
          {STEP_NAMES[currentStep - 1]}
        </h1>
      </div>

      {/* 2. Five Steps Navigation Indicator */}
      <div className="grid grid-cols-5 gap-2 lg:gap-4">
        {STEP_NAMES.map((name, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;

          return (
            <button
              key={name}
              type="button"
              onClick={() => {
                if (stepNum < currentStep) setCurrentStep(stepNum);
              }}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-oma-blue-tint border-oma-blue text-oma-blue font-medium'
                  : isCompleted
                  ? 'bg-white border-oma-border-base text-oma-text-primary hover:border-oma-border-input cursor-pointer'
                  : 'bg-white border-oma-border-base text-oma-text-secondary cursor-not-allowed opacity-60'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                  isActive
                    ? 'bg-oma-blue text-white'
                    : isCompleted
                    ? 'bg-oma-green text-white'
                    : 'bg-oma-bg-card text-oma-text-secondary'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
              </span>
              <span className="text-sm truncate hidden sm:inline">{name}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Form Content & Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: УСЛУГА */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-oma-border-base space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-oma-text-primary mb-1">
                  {service.title}
                </h2>
                <p className="text-sm text-oma-text-secondary">
                  Фиксированная цена · {formatBYN(service.price)} за 1 шт.
                </p>
              </div>

              {/* Segmented Source Switch */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-oma-text-secondary">
                  Где приобретён товар:
                </label>
                <div className="inline-flex rounded-xl p-1 bg-oma-bg-page border border-oma-border-base">
                  <button
                    type="button"
                    onClick={() => setProductSource('oma')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      productSource === 'oma'
                        ? 'bg-white text-oma-blue shadow-sm'
                        : 'text-oma-text-secondary hover:text-oma-text-primary'
                    }`}
                  >
                    Товар купил в OMA
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductSource('own')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      productSource === 'own'
                        ? 'bg-white text-oma-blue shadow-sm'
                        : 'text-oma-text-secondary hover:text-oma-text-primary'
                    }`}
                  >
                    Товар свой
                  </button>
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-oma-text-secondary">
                  Количество установок:
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl bg-oma-bg-card hover:bg-oma-border-input flex items-center justify-center text-lg font-medium text-oma-text-primary transition-colors cursor-pointer"
                  >
                    −
                  </button>
                  <span className="text-lg font-medium min-w-8 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 rounded-xl bg-oma-bg-card hover:bg-oma-border-input flex items-center justify-center text-lg font-medium text-oma-text-primary transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Linked Product Info */}
              {initialProduct && productSource === 'oma' && (
                <div className="p-4 bg-oma-bg-card rounded-2xl flex items-center gap-4 border border-oma-border-base">
                  <img
                    src={initialProduct.image}
                    alt={initialProduct.name}
                    className="w-14 h-14 object-contain rounded-lg bg-white p-1 border border-oma-border-base"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-oma-text-secondary">Выбранный товар</p>
                    <p className="text-sm font-medium text-oma-text-primary truncate">
                      {initialProduct.name}
                    </p>
                    <p className="text-xs text-oma-blue mt-0.5">
                      Арт. {initialProduct.sku} · {formatBYN(initialProduct.price)}
                    </p>
                  </div>
                </div>
              )}

              {/* Ready on Site Checkbox */}
              <div className="pt-2">
                <Checkbox
                  checked={readyOnSite}
                  onChange={(e) => setReadyOnSite(e.target.checked)}
                  content="Товар будет на месте к приезду мастера"
                  size="l"
                />
              </div>

              <div className="p-4 bg-oma-blue-tint rounded-2xl border border-oma-blue/20 text-xs text-oma-text-secondary leading-relaxed">
                В стоимость входит: демонтаж, монтаж, подключение к готовым выводам и базовая проверка работы. Расходные материалы оплачиваются отдельно по чеку.
              </div>
            </div>
          )}

          {/* STEP 2: АДРЕС */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-oma-border-base space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-oma-text-primary mb-1">
                  Адрес выполнения работ
                </h2>
                <p className="text-sm text-oma-text-secondary">
                  Мастер приедет по указанному адресу в согласованное время
                </p>
              </div>

              {/* Quick Saved Address Chip */}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-oma-blue-tint border border-oma-blue text-oma-blue rounded-xl text-sm font-medium flex items-center gap-2"
                >
                  <GeoPin className="w-4 h-4" /> Дом · {address.street}, {address.house}
                </button>
              </div>

              {/* Address Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-oma-text-secondary">
                    Город и улица *
                  </label>
                  <TextInput
                    size="xl"
                    value={`${address.city}, ${address.street}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(',');
                      setAddress({
                        ...address,
                        city: parts[0]?.trim() || address.city,
                        street: parts[1]?.trim() || address.street,
                      });
                    }}
                    placeholder="Например, Минск, ул. Притыцкого"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-oma-text-secondary">Дом / Корпус *</label>
                  <TextInput
                    size="xl"
                    value={address.house}
                    onChange={(e) => setAddress({ ...address, house: e.target.value })}
                    placeholder="10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-oma-text-secondary">Квартира *</label>
                  <TextInput
                    size="xl"
                    value={address.apt}
                    onChange={(e) => setAddress({ ...address, apt: e.target.value })}
                    placeholder="24"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-oma-text-secondary">Подъезд</label>
                  <TextInput
                    size="xl"
                    value={address.entrance}
                    onChange={(e) => setAddress({ ...address, entrance: e.target.value })}
                    placeholder="2"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-oma-text-secondary">Этаж</label>
                  <TextInput
                    size="xl"
                    value={address.floor}
                    onChange={(e) => setAddress({ ...address, floor: e.target.value })}
                    placeholder="4"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-oma-text-secondary">Код домофона</label>
                  <TextInput
                    size="xl"
                    value={address.intercom}
                    onChange={(e) => setAddress({ ...address, intercom: e.target.value })}
                    placeholder="24 или К24"
                  />
                </div>
              </div>

              {/* Map Preview Banner */}
              <div className="p-4 bg-oma-bg-card rounded-2xl border border-oma-border-base flex items-center gap-3">
                <GeoPin className="w-5 h-5 text-oma-blue shrink-0" />
                <div className="text-xs text-oma-text-secondary">
                  Зона выезда мастера: <span className="font-medium text-oma-text-primary">Минск и до 15 км от МКАД</span>. Доплат за выезд в черте города нет.
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ВРЕМЯ */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-oma-border-base space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-oma-text-primary mb-1">
                  Дата и интервал визита
                </h2>
                <p className="text-sm text-oma-text-secondary">
                  Выберите удобный день и временное окно приезда мастера
                </p>
              </div>

              {/* 14-day Calendar Grid */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-oma-text-secondary">Выберите дату:</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {dates.map((d) => {
                    const isSelected = selectedDate === d.fullDate;
                    return (
                      <button
                        key={d.fullDate}
                        type="button"
                        onClick={() => setSelectedDate(d.fullDate)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-oma-blue border-oma-blue text-white shadow-sm'
                            : 'bg-white border-oma-border-base hover:border-oma-blue/40 text-oma-text-primary'
                        }`}
                      >
                        <div
                          className={`text-[11px] font-medium uppercase ${
                            isSelected ? 'text-white/80' : 'text-oma-text-secondary'
                          }`}
                        >
                          {d.dayName}
                        </div>
                        <div className="text-base font-semibold mt-0.5">{d.dayNum}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-oma-text-secondary">
                  Временной интервал:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3.5 px-4 rounded-xl border text-center font-medium text-sm transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-oma-blue-tint border-oma-blue text-oma-blue font-semibold ring-1 ring-oma-blue'
                            : 'bg-white border-oma-border-base hover:border-oma-border-input text-oma-text-primary'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Sync Checkbox */}
              <div className="pt-2">
                <Checkbox
                  checked={syncWithDelivery}
                  onChange={(e) => setSyncWithDelivery(e.target.checked)}
                  content="Согласовать время с доставкой товара (мастер приедет после привоза товара)"
                  size="l"
                />
              </div>
            </div>
          )}

          {/* STEP 4: ДЕТАЛИ */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-oma-border-base space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-oma-text-primary mb-1">
                  Детали и фото места работ
                </h2>
                <p className="text-sm text-oma-text-secondary">
                  Фото помогают мастеру оценить фронт работ и взять нужный инструмент
                </p>
              </div>

              {/* 5 Photo Upload Slots */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-oma-text-secondary">
                  Фотографии места установки (до 5 шт.):
                </label>
                <div className="flex flex-wrap gap-3">
                  {photos.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 rounded-2xl overflow-hidden border border-oma-border-base group"
                    >
                      <img src={src} alt="Upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <TrashBin className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  {photos.length < 5 && (
                    <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-oma-border-input hover:border-oma-blue flex flex-col items-center justify-center gap-1.5 cursor-pointer text-oma-text-secondary hover:text-oma-blue transition-colors">
                      <Camera className="w-6 h-6" />
                      <span className="text-xs font-medium">+ Фото</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Material Chips */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-oma-text-secondary">
                  Материал стен / основания:
                </label>
                <div className="flex flex-wrap gap-2">
                  {MATERIALS.map((mat) => {
                    const isSelected = selectedMaterial === mat;
                    return (
                      <button
                        key={mat}
                        type="button"
                        onClick={() => setSelectedMaterial(mat)}
                        className={`px-4 py-2 rounded-xl border text-sm transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-oma-blue text-white border-oma-blue font-medium'
                            : 'bg-white border-oma-border-base hover:border-oma-border-input text-oma-text-primary'
                        }`}
                      >
                        {mat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dismantle Checkbox */}
              <div className="pt-2">
                <Checkbox
                  checked={needDismantle}
                  onChange={(e) => setNeedDismantle(e.target.checked)}
                  content="Требуется демонтаж старого сантехнического оборудования (+10 руб.)"
                  size="l"
                />
              </div>

              {/* Comments for Master */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-oma-text-secondary">
                  Комментарий для мастера
                </label>
                <TextArea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Код шлагбаума, отключена ли вода, особенности труб или стен..."
                />
              </div>
            </div>
          )}

          {/* STEP 5: ПОДТВЕРЖДЕНИЕ */}
          {currentStep === 5 && (
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-oma-border-base space-y-6">
              <div>
                <h2 className="text-2xl font-medium text-oma-text-primary mb-1">
                  Подтверждение заказа
                </h2>
                <p className="text-sm text-oma-text-secondary">
                  Проверьте все детали перед подтверждением заявки
                </p>
              </div>

              {/* Summary Cards */}
              <div className="divide-y divide-oma-border-base border border-oma-border-base rounded-2xl overflow-hidden">
                <div className="p-4 flex items-center justify-between bg-oma-bg-page/50">
                  <div>
                    <p className="text-xs text-oma-text-secondary">Услуга</p>
                    <p className="text-base font-medium text-oma-text-primary">
                      {service.title} · {quantity} шт.
                    </p>
                    {needDismantle && (
                      <p className="text-xs text-oma-blue mt-0.5">+ Демонтаж старого оборудования</p>
                    )}
                  </div>
                  <span className="text-base font-semibold">{formatBYN(subtotal)}</span>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-oma-text-secondary">Адрес</p>
                    <p className="text-sm font-medium text-oma-text-primary">
                      {address.city}, {address.street}, д. {address.house}, кв. {address.apt}
                    </p>
                    <p className="text-xs text-oma-text-secondary mt-0.5">
                      Подъезд {address.entrance}, этаж {address.floor}, домофон {address.intercom}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-oma-blue hover:underline cursor-pointer"
                  >
                    Изменить
                  </button>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-oma-text-secondary">Дата и время</p>
                    <p className="text-sm font-medium text-oma-text-primary">
                      {selectedDate} · {selectedSlot}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-oma-blue hover:underline cursor-pointer"
                  >
                    Изменить
                  </button>
                </div>

                <div className="p-4 flex items-center justify-between bg-oma-blue-tint/30">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-oma-blue shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-oma-blue">Гарантия OMA</p>
                      <p className="text-xs text-oma-text-secondary">12 месяцев на все выполненные работы</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-oma-blue">Включена</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-medium text-oma-text-secondary">Способ оплаты:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('hold')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentMethod === 'hold'
                        ? 'border-oma-blue bg-oma-blue-tint ring-1 ring-oma-blue'
                        : 'border-oma-border-base bg-white'
                    }`}
                  >
                    <p className="text-sm font-medium text-oma-text-primary">
                      Безопасная сделка онлайн
                    </p>
                    <p className="text-xs text-oma-text-secondary mt-1 leading-relaxed">
                      Деньги холдируются на карте и переводятся только после приёмки работ
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('after')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentMethod === 'after'
                        ? 'border-oma-blue bg-oma-blue-tint ring-1 ring-oma-blue'
                        : 'border-oma-border-base bg-white'
                    }`}
                  >
                    <p className="text-sm font-medium text-oma-text-primary">
                      Оплата после приёмки
                    </p>
                    <p className="text-xs text-oma-text-secondary mt-1 leading-relaxed">
                      Картой или наличными мастеру после подписания акта выполненных работ
                    </p>
                  </button>
                </div>
              </div>

              {/* Bonus Balance Deduction */}
              {bonusesAvailable > 0 && (
                <div className="p-4 bg-oma-bg-card rounded-2xl border border-oma-border-base flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-oma-text-primary">
                      Списать бонусы «Баланс»
                    </p>
                    <p className="text-xs text-oma-text-secondary">
                      Доступно {bonusesAvailable} Б (можно оплатить до 30% стоимости услуги)
                    </p>
                  </div>
                  <Checkbox
                    checked={applyBonuses}
                    onChange={(e) => setApplyBonuses(e.target.checked)}
                    size="l"
                  />
                </div>
              )}
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="bg-white rounded-3xl p-6 border border-oma-border-base flex items-center justify-between gap-4">
            <Button
              view="outlined"
              size="xl"
              onClick={handlePrev}
              className="!rounded-xl px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'К каталогу' : 'Назад'}
            </Button>

            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <div className="text-xl font-bold text-oma-text-primary">
                  {formatBYN(finalPrice)}
                </div>
                <div className="text-xs text-oma-blue font-medium">
                  +{earnedBonuses} Б после приёмки
                </div>
              </div>

              <Button
                view="action"
                size="xl"
                onClick={handleNext}
                className="!bg-[#005DD6] !text-white !rounded-xl !h-[52px] px-8 text-base font-medium hover:!bg-[#004EB8] transition-colors"
              >
                {currentStep === 5 ? `Заказать · ${formatBYN(finalPrice)}` : `Продолжить · ${formatBYN(finalPrice)}`}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Summary Panel (4 Cols - 344 px) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-oma-border-base space-y-6 sticky top-28">
          <h3 className="text-xl font-semibold text-oma-text-primary">Ваш заказ</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center text-oma-text-secondary">
              <span>Услуга</span>
              <span className="text-oma-text-primary font-medium">{formatBYN(basePrice)}</span>
            </div>

            {needDismantle && (
              <div className="flex justify-between items-center text-oma-text-secondary">
                <span>Демонтаж</span>
                <span className="text-oma-text-primary font-medium">{formatBYN(dismantleExtra)}</span>
              </div>
            )}

            {bonusDiscount > 0 && (
              <div className="flex justify-between items-center text-oma-green font-medium">
                <span>Списание бонусов</span>
                <span>−{formatBYN(bonusDiscount)}</span>
              </div>
            )}

            <div className="border-t border-oma-border-base pt-3 flex justify-between items-baseline">
              <span className="text-base font-semibold text-oma-text-primary">Итого</span>
              <span className="text-2xl font-bold text-oma-text-primary">
                {formatBYN(finalPrice)}
              </span>
            </div>

            <div className="text-xs text-oma-blue font-medium text-right">
              +{earnedBonuses} Б после приёмки
            </div>
          </div>

          <div className="p-4 bg-oma-bg-card rounded-2xl border border-oma-border-base space-y-2 text-xs text-oma-text-secondary">
            <div className="flex items-center gap-2 text-oma-text-primary font-medium">
              <ShieldCheck className="w-4 h-4 text-oma-blue" />
              <span>Гарантия 12 месяцев</span>
            </div>
            <p className="leading-relaxed">
              Бесплатная отмена или перенос визита мастера не позднее чем за 24 часа.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
