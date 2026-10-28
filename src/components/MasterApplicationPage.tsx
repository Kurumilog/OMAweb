import React, { useState, useMemo } from 'react';
import { Button, TextInput, TextArea, Checkbox } from '@gravity-ui/uikit';
import {
  ArrowLeft,
  Calendar,
  Clock,
  GeoPin,
  House,
  MapPin,
  ShieldCheck,
  Check,
  Camera,
  TrashBin,
  Sparkles,
} from '@gravity-ui/icons';
import { Service, Product } from '../types';
import servicesData from '../data/services.json';
import productsData from '../data/products.json';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { formatBYN, calculateBonusPoints } from '../config/loyalty';
import { saveOrderMemory } from '../lib/supermemory';
import { GoogleMapPicker } from './GoogleMapPicker';
import { getServiceProductMemory, saveServiceProductMemory } from '../lib/masterMemory';
import { groupCartIntoServiceChecks, resolveServiceForProduct } from '../utils/serviceChecks';

const allServices = servicesData as Service[];
const allProducts = productsData as Product[];

export interface ApplicationOrderData {
  service: Service;
  productSource: 'oma' | 'own';
  productName?: string;
  productPrice?: number;
  productsList?: { name: string; sku: string; price: number; quantity: number }[];
  materialPhotos?: string[];
  materialDescription?: string;
  quantity: number;
  needDismantle: boolean;
  logistics: 'master_pickup' | 'oma_delivery' | 'client_ready';
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

export interface AttachedMaterialItem {
  product: Product;
  quantity: number;
}

interface MasterApplicationPageProps {
  initialService?: Service | null;
  initialProduct?: Product | null;
  initialProducts?: AttachedMaterialItem[];
  productSource?: 'oma' | 'own';
  onBack: () => void;
  onCompleteOrder: (order: ApplicationOrderData) => void;
}

const STEP_NAMES = [
  'Объём и детали',
  'Адрес, время и логистика',
  'Подтверждение и защита оплаты',
];

const TIME_SLOTS = ['10–14', '13–18', '18–22'];
const MATERIALS = ['Плитка / бетон', 'Гипсокартон', 'Кирпич', 'Дерево / брус', 'Другое'];

export const MasterApplicationPage: React.FC<MasterApplicationPageProps> = ({
  initialService,
  initialProduct,
  initialProducts,
  productSource = 'oma',
  onBack,
  onCompleteOrder,
}) => {
  const { user } = useUser();
  const { items } = useCart();
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1: Service & details
  const [service, setService] = useState<Service>(initialService || allServices[0]);
  const [currentProductSource, setCurrentProductSource] = useState<'oma' | 'own'>(productSource);
  const [quantity, setQuantity] = useState(1);
  const [needDismantle, setNeedDismantle] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('Плитка / бетон');
  const [photos, setPhotos] = useState<string[]>([]);
  const [materialPhotos, setMaterialPhotos] = useState<string[]>([]);
  const [materialDescription, setMaterialDescription] = useState('');
  const [comment, setComment] = useState('');

  React.useEffect(() => {
    if (initialService) {
      setService(initialService);
    }
  }, [initialService]);

  const cartChecks = useMemo(() => groupCartIntoServiceChecks(items, true), [items]);
  const activeCheck = useMemo(
    () => cartChecks.serviceChecks.find((c) => c.service.id === service.id) || null,
    [cartChecks, service.id]
  );

  // Attached products: strictly scoped to the current service check (never mixing different services into one check!)
  const attachedMaterials = useMemo<AttachedMaterialItem[]>(() => {
    if (currentProductSource === 'own') return [];

    // 1. If the cart has a service check for this exact service, return ONLY that check's items
    if (activeCheck && activeCheck.items.length > 0) {
      return activeCheck.items.map((i) => ({ product: i.product, quantity: i.quantity }));
    }

    // 2. If explicit list passed, filter out any installable product that belongs to a DIFFERENT service
    if (initialProducts && initialProducts.length > 0) {
      const compatible = initialProducts.filter((ip) => {
        if (!ip.product.installable) {
          return !ip.product.serviceId || ip.product.serviceId === service.id || ip.product.category === service.category;
        }
        const resolved = resolveServiceForProduct(ip.product);
        return !resolved || resolved.id === service.id;
      });
      if (compatible.length > 0) {
        return compatible;
      }
    }

    // 3. If single initialProduct passed and actually matches this service
    if (initialProduct) {
      const resolved = resolveServiceForProduct(initialProduct);
      if (!resolved || resolved.id === service.id) {
        return [{ product: initialProduct, quantity: 1 }];
      }
    }

    // 4. If matching items in Cart (strictly matching this service)
    const matchingCartItems = items.filter(
      (i) => i.installService?.id === service.id || (i.product.serviceId && i.product.serviceId === service.id)
    );
    if (matchingCartItems.length > 0) {
      return matchingCartItems.map((i) => ({ product: i.product, quantity: i.quantity }));
    }

    // 5. Check persistent memory for this service
    const remembered = getServiceProductMemory(service.id);
    if (remembered?.product && (remembered.product.serviceId === service.id || remembered.product.category === service.category)) {
      return [{ product: remembered.product, quantity: 1 }];
    }

    // 6. Intelligent match from allProducts for this service (never random drill for faucet!)
    const matched = allProducts.find((p) => {
      if (p.serviceId === service.id) return true;
      if (service.category === 'santekhnika') {
        return service.id.includes('faucet') ? p.name.toLowerCase().includes('смеситель') : p.category === 'santekhnika';
      }
      if (service.category === 'otdelka') {
        return service.id.includes('laminate') ? p.name.toLowerCase().includes('ламинат') : p.name.toLowerCase().includes('краска');
      }
      if (service.category === 'elektrika') {
        return p.name.toLowerCase().includes('светильник') || p.name.toLowerCase().includes('люстра');
      }
      return p.category === service.category;
    });

    if (matched) {
      return [{ product: matched, quantity: 1 }];
    }

    return [];
  }, [currentProductSource, activeCheck, initialProducts, initialProduct, service, items]);

  const attachedProduct = attachedMaterials[0]?.product || null;

  // STEP 2: Address & Time
  const [address, setAddress] = useState({
    city: user?.city || 'Минск',
    street: 'ул. Притыцкого',
    house: '10',
    apt: '24',
    entrance: '2',
    floor: '4',
    intercom: '24',
  });

  const dates = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      const dayName = d.toLocaleDateString('ru-RU', { weekday: 'short' });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString('ru-RU', { month: 'short' });
      return { fullDate: `${dayNum} ${month}`, dayName, dayNum };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState(dates[1]?.fullDate || '29 окт.');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [logistics, setLogistics] = useState<'master_pickup' | 'oma_delivery' | 'client_ready'>('master_pickup');

  // STEP 3: Payment & Protected Escrow
  const [paymentMethod, setPaymentMethod] = useState<'hold' | 'after'>('hold');
  const [applyBonuses, setApplyBonuses] = useState(false);
  const [isSearchingMaster, setIsSearchingMaster] = useState(false);

  // Price calculations
  const serviceSubtotal = service.price * quantity;
  const productSubtotal = currentProductSource === 'oma'
    ? attachedMaterials.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    : 0;
  const dismantleExtra = needDismantle ? 10 : 0;
  const deliveryExtra = 0;
  const subtotal = serviceSubtotal + productSubtotal + dismantleExtra;

  const maxBonusSpend = Math.min(user.bonusBalance, Math.floor(subtotal * 0.3));
  const bonusDiscount = applyBonuses ? maxBonusSpend : 0;
  const finalPrice = Math.max(0, subtotal - bonusDiscount);
  const earnedBonuses = Math.max(3, Math.round(serviceSubtotal * 0.05) + calculateBonusPoints(productSubtotal));

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Trigger system auto-assignment (Yandex model per context.md)
      setIsSearchingMaster(true);
      window.setTimeout(() => {
        // Save to persistent service memory
        saveServiceProductMemory(service.id, attachedMaterials[0]?.product || null, currentProductSource);

        const orderData: ApplicationOrderData = {
          service,
          productSource: currentProductSource,
          productName:
            currentProductSource === 'oma'
              ? attachedMaterials.length > 1
                ? `Комплект материалов (${attachedMaterials.length} поз.)`
                : attachedMaterials[0]?.product.name
              : undefined,
          productPrice: productSubtotal,
          productsList: attachedMaterials.map((m) => ({
            name: m.product.name,
            sku: m.product.sku,
            price: m.product.price,
            quantity: m.quantity,
          })),
          materialPhotos,
          materialDescription,
          quantity,
          needDismantle,
          logistics,
          address,
          date: selectedDate,
          timeSlot: selectedSlot,
          photos,
          material: selectedMaterial,
          comment,
          paymentMethod,
          useBonuses: bonusDiscount,
          totalPrice: finalPrice,
        };

        // Persist to Supermemory
        void saveOrderMemory(user.id, {
          id: `ord_${Date.now().toString(36)}`,
          category: service.categoryLabel || service.title,
          address: `${address.city}, ${address.street}, д. ${address.house}, кв. ${address.apt}`,
          timeWindow: `${selectedDate} · ${selectedSlot}`,
          status: 'Мастер назначен',
          masterName: 'Алексей С.',
          total: finalPrice,
          items: [
            {
              name: service.title,
              quantity,
              price: service.price,
              install: true,
            },
            ...(attachedProduct
              ? [
                  {
                    name: attachedProduct.name,
                    quantity: 1,
                    price: attachedProduct.price,
                    install: false,
                  },
                ]
              : []),
          ],
        });

        setIsSearchingMaster(false);
        onCompleteOrder(orderData);
      }, 1600);
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

  const handleMaterialPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result && materialPhotos.length < 4) {
          setMaterialPhotos((prev) => [...prev, result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-[#6E6E73] uppercase tracking-wider">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-[#005DD6] transition-colors cursor-pointer"
          >
            ОМА Мастер
          </button>
          <span>·</span>
          <span>Оформление заявки</span>
        </div>
        <h1 className="text-[28px] sm:text-[36px] font-medium text-[#111111] leading-tight">
          {STEP_NAMES[currentStep - 1]}
        </h1>
      </div>

      {/* Separate Checks Switcher when multiple different installation services are in Cart */}
      {cartChecks.serviceChecks.length > 1 && (
        <div className="p-4 sm:p-5 bg-[#EDF4FF] rounded-[20px] border border-[#005DD6]/25 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[13px] font-bold text-[#005DD6]">
                Раздельные чеки по услугам ({cartChecks.serviceChecks.length} усл.)
              </div>
              <p className="text-[12px] text-[#111111]">
                Выбранные товары относятся к разным услугам и оформляются отдельными чеками (на каждую услугу назначается профильный мастер).
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#005DD6] bg-white px-2.5 py-1 rounded-full border border-[#005DD6]/20 shrink-0 self-start sm:self-center">
              Сейчас оформляется: Чек №{activeCheck?.checkNumber || 1}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {cartChecks.serviceChecks.map((chk) => {
              const isSelected = chk.service.id === service.id;
              return (
                <button
                  key={chk.service.id}
                  type="button"
                  onClick={() => {
                    setService(chk.service);
                    setCurrentStep(1);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#005DD6] text-white border-[#005DD6] shadow-xs'
                      : 'bg-white text-[#111111] border-[#E2E4E8] hover:border-[#005DD6]'
                  }`}
                >
                  <span>Чек №{chk.checkNumber}: {chk.service.title}</span>
                  <span className={isSelected ? 'text-white/90 font-bold' : 'text-[#005DD6] font-bold'}>
                    {formatBYN(chk.total)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Three Dense Steps Navigator */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
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
              className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-[20px] border text-left transition-all select-none ${
                isActive
                  ? 'bg-[#EDF4FF] border-[#005DD6] text-[#005DD6] shadow-xs'
                  : isCompleted
                  ? 'bg-white border-[#E2E4E8] text-[#111111] hover:border-[#005DD6]/60 cursor-pointer'
                  : 'bg-white/60 border-[#E2E4E8]/60 text-[#9A9BA1] cursor-not-allowed'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${
                  isActive
                    ? 'bg-[#005DD6] text-white'
                    : isCompleted
                    ? 'bg-[#2D8B5D] text-white'
                    : 'bg-[#ECEDF0] text-[#6E6E73]'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </span>
              <div className="min-w-0">
                <span className="text-[11px] uppercase font-semibold text-[#6E6E73] block">
                  Шаг {stepNum}
                </span>
                <span className="text-[13px] sm:text-[14px] font-medium truncate block">
                  {name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Main Form & Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: ОБЪЁМ И ДЕТАЛИ */}
          {currentStep === 1 && (
            <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#E2E4E8] space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={service.image || `/services/${service.id}.jpg`}
                  alt={service.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-[16px] object-cover border border-[#E2E4E8] shrink-0 bg-[#F4F4F6]"
                />
                <div>
                  <span className="text-[12px] font-medium text-[#005DD6] bg-[#EDF4FF] px-2.5 py-0.5 rounded-full">
                    {service.categoryLabel || 'Услуга ОМА'}
                  </span>
                  <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#111111] mt-1.5 leading-snug">
                    {service.title}
                  </h2>
                  <p className="text-[13px] text-[#6E6E73] mt-0.5">
                    Базовый тариф: {formatBYN(service.price)} {service.unit ? `· ${service.unit}` : ''}
                  </p>
                </div>
              </div>

              {/* Product Source Selector: OMA vs OWN */}
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-[#111111] block">
                  Где приобретён товар / оборудование:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentProductSource('oma');
                      if (attachedProduct) saveServiceProductMemory(service.id, attachedProduct, 'oma');
                    }}
                    className={`p-3 rounded-[14px] border text-left transition-all cursor-pointer ${
                      currentProductSource === 'oma'
                        ? 'border-[#005DD6] bg-[#EDF4FF] ring-1 ring-[#005DD6]'
                        : 'border-[#E2E4E8] bg-white hover:border-[#005DD6]/40'
                    }`}
                  >
                    <div className="text-[13px] font-bold text-[#111111]">Куплю в ОМА / из каталога</div>
                    <p className="text-[11px] text-[#6E6E73] mt-0.5 leading-tight">
                      Гарантия на товар + на работу мастера
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentProductSource('own');
                      saveServiceProductMemory(service.id, null, 'own');
                    }}
                    className={`p-3 rounded-[14px] border text-left transition-all cursor-pointer ${
                      currentProductSource === 'own'
                        ? 'border-[#005DD6] bg-[#EDF4FF] ring-1 ring-[#005DD6]'
                        : 'border-[#E2E4E8] bg-white hover:border-[#005DD6]/40'
                    }`}
                  >
                    <div className="text-[13px] font-bold text-[#111111]">Товар свой / уже куплен</div>
                    <p className="text-[11px] text-[#6E6E73] mt-0.5 leading-tight">
                      Мастер установит и проверит ваше оборудование
                    </p>
                  </button>
                </div>
              </div>

              {/* Attached Materials / Products List */}
              {currentProductSource === 'oma' && attachedMaterials.length > 0 && (
                <div className="space-y-2.5 p-4 bg-[#F4F4F6] rounded-[20px] border border-[#E2E4E8]">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#005DD6] uppercase tracking-wider">
                      {attachedMaterials.length > 1
                        ? `Товары и материалы из каталога ОМА (${attachedMaterials.length} поз.)`
                        : 'Товар из каталога ОМА'}
                    </span>
                    <span className="text-[13px] font-bold text-[#111111]">
                      {formatBYN(productSubtotal)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {attachedMaterials.map(({ product: pItem, quantity: pQty }) => (
                      <div
                        key={pItem.id}
                        className="p-3 bg-white rounded-[14px] flex items-center justify-between gap-3 border border-[#E2E4E8]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={pItem.image}
                            alt={pItem.name}
                            className="w-12 h-12 object-contain rounded-[10px] bg-[#F8F9FA] p-1 border border-[#E2E4E8] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[#111111] truncate">{pItem.name}</p>
                            <p className="text-[11px] text-[#6E6E73]">
                              Арт. {pItem.sku} · {formatBYN(pItem.price)}
                              {pQty > 1 ? ` · ${pQty} шт. = ${formatBYN(pItem.price * pQty)}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-[13px] font-bold text-[#111111] shrink-0">
                          {formatBYN(pItem.price * pQty)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* If Own product selected */}
              {currentProductSource === 'own' && (
                <div className="p-4 bg-[#EDF4FF] rounded-[16px] border border-[#005DD6]/30 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#005DD6]/10 text-[#005DD6] flex items-center justify-center shrink-0">
                    <House className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-[#111111] block">
                      Установка вашего товара (0,00 руб. за материалы)
                    </span>
                    <span className="text-[12px] text-[#6E6E73]">
                      Оплачивается только работа мастера. Пожалуйста, прикрепите фото или описание прибора ниже.
                    </span>
                  </div>
                </div>
              )}

              {/* Material & Goods Photo Upload (for existing items or supplies) */}
              <div className="p-4 sm:p-5 rounded-[20px] bg-[#F4F4F6] border border-[#E2E4E8] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-[14px] font-semibold text-[#111111] block">
                      {currentProductSource === 'own'
                        ? 'Фото и модель вашего товара / материала'
                        : 'Фото вашего материала (если уже куплен)'}
                    </span>
                    <span className="text-[12px] text-[#6E6E73]">
                      Прикрепите фото смесителя, упаковки или маркировки — мастер заранее проверит резьбу и совместимость подводок
                    </span>
                  </div>
                  <span className="inline-block self-start sm:self-auto text-[11px] font-medium text-[#005DD6] bg-[#EDF4FF] px-2.5 py-0.5 rounded-full shrink-0">
                    {currentProductSource === 'own' ? 'Свой товар' : 'Доп. материалы'}
                  </span>
                </div>

                <input
                  type="text"
                  value={materialDescription}
                  onChange={(e) => setMaterialDescription(e.target.value)}
                  placeholder="Укажите модель или бренд (например: Lemark Comfort LM3061C, Keramin...)"
                  className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#E2E4E8] rounded-[12px] text-[#111111] placeholder:text-[#9A9BA1] focus:border-[#005DD6] outline-none"
                />

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {materialPhotos.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative w-18 h-18 rounded-[12px] overflow-hidden border border-[#E2E4E8] group"
                    >
                      <img src={src} alt="Material photo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setMaterialPhotos(materialPhotos.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                      >
                        <TrashBin className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {materialPhotos.length < 4 && (
                    <label className="h-18 px-4 rounded-[12px] border-2 border-dashed border-[#005DD6]/40 hover:border-[#005DD6] bg-white text-[#005DD6] flex items-center gap-2 cursor-pointer transition-colors text-[12px] font-medium">
                      <Camera className="w-4 h-4" />
                      <span>+ Добавить фото материала</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMaterialPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center justify-between p-4 rounded-[16px] bg-[#F4F4F6] border border-[#E2E4E8]">
                <div>
                  <span className="text-[14px] font-medium text-[#111111] block">
                    Количество точек / единиц:
                  </span>
                  <span className="text-[12px] text-[#6E6E73]">
                    {service.unit || '1 точка монтажа'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-[10px] bg-white hover:bg-[#E2E4E8] text-[#111111] flex items-center justify-center text-[16px] font-bold border border-[#E2E4E8] transition-colors cursor-pointer"
                  >
                    −
                  </button>
                  <span className="text-[16px] font-bold min-w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-[10px] bg-white hover:bg-[#E2E4E8] text-[#111111] flex items-center justify-center text-[16px] font-bold border border-[#E2E4E8] transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Dismantle Checkbox */}
              <div className="p-4 rounded-[16px] border border-[#E2E4E8] bg-white flex items-start gap-3">
                <Checkbox
                  checked={needDismantle}
                  onUpdate={(val) => setNeedDismantle(val)}
                  size="l"
                />
                <div>
                  <span className="text-[14px] font-medium text-[#111111] block">
                    Требуется демонтаж старого оборудования (+10,00 руб.)
                  </span>
                  <span className="text-[12px] text-[#6E6E73]">
                    Мастер аккуратно снимет старый прибор, перекроет краны и подготовит выводы
                  </span>
                </div>
              </div>

              {/* Wall Material Chips */}
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-[#111111] block">
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
                        className={`h-[36px] px-3.5 rounded-[10px] border text-[13px] font-medium transition-colors cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#005DD6] text-white border-[#005DD6]'
                            : 'bg-white border-[#E2E4E8] text-[#111111] hover:border-[#005DD6]/60'
                        }`}
                      >
                        {mat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo Uploads */}
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-[#111111] block">
                  Фотографии места работ (до 5 шт.):
                </label>
                <p className="text-[12px] text-[#6E6E73]">
                  Помогут мастеру оценить особенности разводки и взять нужные фитинги / свёрла
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  {photos.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-[14px] overflow-hidden border border-[#E2E4E8] group"
                    >
                      <img src={src} alt="Upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                      >
                        <TrashBin className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  {photos.length < 5 && (
                    <label className="w-20 h-20 rounded-[14px] border-2 border-dashed border-[#E2E4E8] hover:border-[#005DD6] flex flex-col items-center justify-center gap-1 cursor-pointer text-[#6E6E73] hover:text-[#005DD6] transition-colors bg-[#F4F4F6]/50">
                      <Camera className="w-5 h-5" />
                      <span className="text-[11px] font-medium">+ Фото</span>
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

              {/* Comments */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#111111] block">
                  Комментарий для мастера
                </label>
                <TextArea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Особенности подключения, наличие лифта, отключена ли вода, удобные ориентиры..."
                />
              </div>
            </div>
          )}

          {/* STEP 2: АДРЕС И ВРЕМЯ */}
          {currentStep === 2 && (
            <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#E2E4E8] space-y-6">
              <div>
                <h2 className="text-[22px] font-medium text-[#111111]">
                  Куда и когда приехать мастеру
                </h2>
              </div>

              {/* Address inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[12px] font-medium text-[#6E6E73] flex items-center gap-1.5">
                    <House className="w-3.5 h-3.5 text-[#005DD6]" />
                    <span>Город и улица *</span>
                  </label>
                  <TextInput
                    size="l"
                    value={`${address.city}, ${address.street}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(',');
                      setAddress({
                        ...address,
                        city: parts[0]?.trim() || address.city,
                        street: parts[1]?.trim() || address.street,
                      });
                    }}
                    placeholder="Минск, ул. Притыцкого"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#6E6E73]">Дом *</label>
                  <TextInput
                    size="l"
                    value={address.house}
                    onChange={(e) => setAddress({ ...address, house: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#6E6E73]">Квартира *</label>
                  <TextInput
                    size="l"
                    value={address.apt}
                    onChange={(e) => setAddress({ ...address, apt: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#6E6E73]">Подъезд</label>
                  <TextInput
                    size="l"
                    value={address.entrance}
                    onChange={(e) => setAddress({ ...address, entrance: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[#6E6E73]">Этаж / Домофон</label>
                  <TextInput
                    size="l"
                    value={`${address.floor} эт., код ${address.intercom}`}
                    onChange={(e) => setAddress({ ...address, floor: e.target.value })}
                  />
                </div>
              </div>

              {/* Интерактивная карта Google Maps */}
              <GoogleMapPicker
                city={address.city}
                street={address.street}
                house={address.house}
              />

              {/* 14-day Calendar */}
              <div className="space-y-2 pt-2 border-t border-[#E2E4E8]">
                <label className="text-[13px] font-medium text-[#111111] block">
                  Выберите день визита:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {dates.map((d) => {
                    const isSelected = selectedDate === d.fullDate;
                    return (
                      <button
                        key={d.fullDate}
                        type="button"
                        onClick={() => setSelectedDate(d.fullDate)}
                        className={`p-2.5 rounded-[14px] border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#005DD6] border-[#005DD6] text-white shadow-xs'
                            : 'bg-white border-[#E2E4E8] hover:border-[#005DD6]/40 text-[#111111]'
                        }`}
                      >
                        <div
                          className={`text-[11px] font-medium uppercase ${
                            isSelected ? 'text-white/80' : 'text-[#6E6E73]'
                          }`}
                        >
                          {d.dayName}
                        </div>
                        <div className="text-[16px] font-bold mt-0.5">{d.dayNum}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-[#111111] block">
                  Временное окно:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 px-4 rounded-[12px] border text-center font-medium text-[14px] transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#EDF4FF] border-[#005DD6] text-[#005DD6] font-bold ring-1 ring-[#005DD6]'
                            : 'bg-white border-[#E2E4E8] hover:border-[#9A9BA1] text-[#111111]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ПОДТВЕРЖДЕНИЕ И ЗАЩИЩЁННАЯ ОПЛАТА */}
          {currentStep === 3 && (
            <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#E2E4E8] space-y-6">
              <div>
                <h2 className="text-[22px] font-medium text-[#111111]">
                  Подтверждение заказа и Защищённая оплата ОМА
                </h2>
                <p className="text-[14px] text-[#6E6E73] mt-0.5">
                  Проверьте параметры заявки. Средства замораживаются на счёте ОМА и переводятся мастеру только после вашей финальной приёмки.
                </p>
              </div>

              {/* Detailed Summary Cards */}
              <div className="divide-y divide-[#E2E4E8] border border-[#E2E4E8] rounded-[20px] overflow-hidden">
                <div className="p-4 bg-[#F4F4F6] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#6E6E73] block">
                      Услуга
                    </span>
                    <span className="text-[15px] font-medium text-[#111111]">
                      {service.title} · {quantity} шт.
                    </span>
                  </div>
                  <span className="text-[15px] font-bold">{formatBYN(serviceSubtotal)}</span>
                </div>

                {attachedProduct && productSource === 'oma' && (
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#6E6E73] block">
                        Товар из каталога ОМА
                      </span>
                      <span className="text-[14px] font-medium text-[#111111]">
                        {attachedProduct.name}
                      </span>
                    </div>
                    <span className="text-[14px] font-bold">{formatBYN(productSubtotal)}</span>
                  </div>
                )}

                <div className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#6E6E73] block">
                      Адрес и время визита
                    </span>
                    <span className="text-[13px] text-[#111111]">
                      {address.city}, {address.street}, д. {address.house}, кв. {address.apt} · {selectedDate}, {selectedSlot}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[12px] text-[#005DD6] hover:underline cursor-pointer"
                  >
                    Изменить
                  </button>
                </div>

                <div className="p-4 flex items-center justify-between bg-[#EDF4FF]/40">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#005DD6]" />
                    <div>
                      <span className="text-[13px] font-semibold text-[#005DD6] block">
                        Официальная гарантия ОМА
                      </span>
                      <span className="text-[12px] text-[#6E6E73]">
                        12 месяцев на все работы · Электронный гарантийный талон в кабинете
                      </span>
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold text-[#005DD6]">Включена</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3 pt-1">
                <label className="text-[13px] font-medium text-[#111111] block">
                  Способ расчёта:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('hold')}
                    className={`p-4 rounded-[16px] border text-left transition-all cursor-pointer ${
                      paymentMethod === 'hold'
                        ? 'border-[#005DD6] bg-[#EDF4FF] ring-1 ring-[#005DD6]'
                        : 'border-[#E2E4E8] bg-white'
                    }`}
                  >
                    <div className="text-[14px] font-bold text-[#111111]">
                      Защищённая онлайн-оплата (Рекомендуется)
                    </div>
                    <p className="text-[12px] text-[#6E6E73] mt-1 leading-snug">
                      Деньги замораживаются на счёте ОМА и переводятся мастеру только после проверки и подписания электронного акта
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('after')}
                    className={`p-4 rounded-[16px] border text-left transition-all cursor-pointer ${
                      paymentMethod === 'after'
                        ? 'border-[#005DD6] bg-[#EDF4FF] ring-1 ring-[#005DD6]'
                        : 'border-[#E2E4E8] bg-white'
                    }`}
                  >
                    <div className="text-[14px] font-bold text-[#111111]">Оплата после приёмки</div>
                    <p className="text-[12px] text-[#6E6E73] mt-1 leading-snug">
                      Оплата картой или наличными мастеру после завершения работ и проверки
                    </p>
                  </button>
                </div>
              </div>

              {/* Bonus deduction */}
              {user.bonusBalance > 0 && (
                <div className="p-4 bg-[#F4F4F6] rounded-[16px] border border-[#E2E4E8] flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-medium text-[#111111] block">
                      Списать бонусы программы лояльности
                    </span>
                    <span className="text-[12px] text-[#6E6E73]">
                      Доступно {user.bonusBalance} руб. (до 20% стоимости)
                    </span>
                  </div>
                  <Checkbox
                    checked={applyBonuses}
                    onUpdate={(val) => setApplyBonuses(val)}
                    size="l"
                  />
                </div>
              )}
            </div>
          )}

          {/* Bottom Step Actions */}
          <div className="bg-white rounded-[20px] p-5 border border-[#E2E4E8] flex items-center justify-between gap-4">
            <Button
              view="outlined"
              size="l"
              onClick={handlePrev}
              className="!rounded-[12px] !px-5"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {currentStep === 1 ? 'К услуге' : 'Назад'}
            </Button>

            <Button
              view="action"
              size="xl"
              onClick={handleNext}
              className="!bg-[#005DD6] hover:!bg-[#004EB8] !text-white !rounded-[12px] !h-[48px] !px-8 text-[15px] font-medium"
            >
              {currentStep === 3
                ? `Подтвердить и назначить мастера · ${formatBYN(finalPrice)}`
                : `Продолжить · ${formatBYN(finalPrice)}`}
            </Button>
          </div>
        </div>

        {/* Right Summary Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-[24px] p-6 border border-[#E2E4E8] space-y-5 sticky top-24">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[20px] font-medium text-[#111111]">
              {cartChecks.serviceChecks.length > 1
                ? `Чек №${activeCheck?.checkNumber || 1} из ${cartChecks.serviceChecks.length}`
                : 'Сводка заявки'}
            </h3>
            {cartChecks.serviceChecks.length > 1 && (
              <span className="text-[11px] font-bold text-[#005DD6] bg-[#EDF4FF] px-2.5 py-0.5 rounded-full">
                Отдельный чек
              </span>
            )}
          </div>

          <div className="space-y-3 text-[13px] border-b border-[#E2E4E8] pb-4">
            <div className="flex justify-between items-center text-[#6E6E73]">
              <span>Услуга ({quantity} шт.)</span>
              <span className="text-[#111111] font-medium">{formatBYN(serviceSubtotal)}</span>
            </div>

            {currentProductSource === 'oma' && productSubtotal > 0 && (
              <div className="flex justify-between items-center text-[#6E6E73]">
                <span className="truncate pr-2">
                  {attachedMaterials.length > 1
                    ? `Материалы ОМА (${attachedMaterials.length} поз.)`
                    : `Товар: ${attachedMaterials[0]?.product.name}`}
                </span>
                <span className="text-[#111111] font-medium shrink-0">
                  {formatBYN(productSubtotal)}
                </span>
              </div>
            )}

            {currentProductSource === 'own' && (
              <div className="flex justify-between items-center text-[#2D8B5D] text-[12px]">
                <span>Материалы заказчика</span>
                <span className="font-medium">0,00 руб.</span>
              </div>
            )}

            {needDismantle && (
              <div className="flex justify-between items-center text-[#6E6E73]">
                <span>Демонтаж</span>
                <span className="text-[#111111] font-medium">{formatBYN(dismantleExtra)}</span>
              </div>
            )}

            {bonusDiscount > 0 && (
              <div className="flex justify-between items-center text-[#2D8B5D] font-medium">
                <span>Списание бонусов</span>
                <span>−{formatBYN(bonusDiscount)}</span>
              </div>
            )}
          </div>

          <div>
            <div className="text-[28px] font-bold text-[#111111] leading-none">
              {formatBYN(finalPrice)}
            </div>
            <p className="text-[12px] text-[#005DD6] font-medium mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{earnedBonuses} Б на карту «Баланс» после приёмки</span>
            </p>
          </div>

          <div className="p-4 bg-[#EDF4FF]/50 rounded-[16px] border border-[#005DD6]/20 text-[12px] text-[#6E6E73] space-y-1">
            <div className="font-semibold text-[#005DD6]">Автоподбор ОМА (Яндекс-модель)</div>
            <p className="leading-relaxed">
              Система автоматически назначит ближайшего мастера с рейтингом 4.8+ по Минску сразу после подтверждения.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive System Master Assignment Overlay (Yandex-model from context.md) */}
      {isSearchingMaster && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 max-w-md w-full text-center space-y-4 shadow-xl border border-[#E2E4E8] animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#EDF4FF] text-[#005DD6] flex items-center justify-center mx-auto text-2xl animate-pulse">
              <Clock className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-[20px] font-medium text-[#111111]">
              Система ОМА подбирает мастера...
            </h3>
            <p className="text-[13px] text-[#6E6E73] leading-relaxed">
              Поиск свободного аттестованного специалиста по району «{address.street}» с рейтингом не ниже 4.8 ★
            </p>
            <div className="p-3 bg-[#F4F4F6] rounded-[14px] text-[12px] text-[#005DD6] font-medium">
              ✓ Заявка на мастера зафиксирована · Защита оплаты активирована
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
