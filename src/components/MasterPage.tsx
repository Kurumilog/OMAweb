import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  MapPin,
  MessageCircle,
  Package,
  Send,
  Sparkles,
  Star,
  Timer,
  Truck,
  Wrench,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { CartItem, Product, Service } from '../types';
import productsData from '../data/products.json';
import servicesData from '../data/services.json';
import { CATALOG_CATEGORIES } from './SidebarCatalog';
import {
  BONUS_RATE_GOODS,
  BONUS_RATE_SERVICE,
  formatBYN,
} from '../config/loyalty';
import {
  ChatMessage,
  saveChatTranscript,
  saveOrderMemory,
  searchUserMemory,
} from '../lib/supermemory';

interface MasterPageProps {
  initialProducts?: Product[];
  onBackToCatalog: () => void;
  onOpenProduct: (product: Product) => void;
}

const allProducts = productsData as Product[];
const allServices = servicesData as Service[];

const MASTERS = [
  { id: 'm1', name: 'Дмитрий К.', rating: 4.9, jobs: 312, distance: '1.2 км', eta: '15 мин' },
  { id: 'm2', name: 'Андрей П.', rating: 4.8, jobs: 198, distance: '2.4 км', eta: '25 мин' },
  { id: 'm3', name: 'Сергей М.', rating: 5.0, jobs: 421, distance: '3.1 км', eta: '35 мин' },
];

const STEPS = [
  { id: 1, title: 'Заявка', hint: 'Фото, адрес и товары из корзины' },
  { id: 2, title: 'Ориентир цены', hint: 'Смета по прейскуранту' },
  { id: 3, title: 'Чат с мастером', hint: 'Уточнение и замена позиций' },
  { id: 4, title: 'Согласование', hint: 'Фиксация сметы и сроков' },
  { id: 5, title: 'Оплата', hint: 'Safe Deal: холд до приёмки' },
  { id: 6, title: 'Логистика', hint: 'Доставка или самовывоз' },
  { id: 7, title: 'Выезд', hint: 'В пути → на месте → ПИН' },
  { id: 8, title: 'Приёмка', hint: 'Фото до/после' },
  { id: 9, title: 'Завершение', hint: 'Бонусы, отзыв и гарантия' },
];

const CATEGORY_OPTIONS = CATALOG_CATEGORIES.filter((category) => category.id !== 'all');

function nowIso() {
  return new Date().toISOString();
}

export const MasterPage: React.FC<MasterPageProps> = ({
  initialProducts,
  onBackToCatalog,
  onOpenProduct,
}) => {
  const { items, addToCart, replaceProductInCart, setIsCartOpen } = useCart();
  const { user, addBonuses } = useUser();

  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoHint, setPhotoHint] = useState('');
  const [category, setCategory] = useState(
    initialProducts?.[0]?.category ?? 'santekhnika'
  );
  const [address, setAddress] = useState('Минск, ул. Немига, 12');
  const [timeWindow, setTimeWindow] = useState('Сегодня, 16:00–18:00');
  const [comment, setComment] = useState('');

  const [selectedMaster, setSelectedMaster] = useState(MASTERS[0]);
  const [searching, setSearching] = useState(false);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [suggestion, setSuggestion] = useState<Product | null>(null);

  const [clientAgreed, setClientAgreed] = useState(false);
  const [paid, setPaid] = useState(false);
  const [logistics, setLogistics] = useState<'delivery' | 'pickup'>('delivery');
  const [trip, setTrip] = useState<'idle' | 'on_way' | 'arrived' | 'working'>('idle');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [beforePhoto, setBeforePhoto] = useState(false);
  const [afterPhoto, setAfterPhoto] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewSent, setReviewSent] = useState(false);
  const [rewarded, setRewarded] = useState(false);

  const [orderId, setOrderId] = useState(() => `ord_${Date.now().toString(36)}`);
  const [orderSnapshot, setOrderSnapshot] = useState<CartItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderBonuses, setOrderBonuses] = useState(0);

  const currentItems = step < 4 || orderSnapshot.length === 0 ? items : orderSnapshot;
  const goodsTotal = currentItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const servicesTotal = currentItems.reduce(
    (sum, item) => sum + (item.installService ? item.installService.price * item.quantity : 0),
    0
  );
  const currentTotal =
    step < 4 || orderTotal === 0 ? goodsTotal + servicesTotal : orderTotal;
  const currentBonuses =
    step < 4 || orderBonuses === 0
      ? Math.round(goodsTotal * BONUS_RATE_GOODS + servicesTotal * BONUS_RATE_SERVICE)
      : orderBonuses;

  const estimate = useMemo(() => {
    if (servicesTotal > 0) return `от ${formatBYN(servicesTotal)}`;
    const service = allServices.find((item) => item.id === initialProducts?.[0]?.serviceId);
    return service ? `от ${formatBYN(service.price)}` : 'после диагностики';
  }, [servicesTotal, initialProducts]);

  const orderCategory =
    CATEGORY_OPTIONS.find((option) => option.id === category)?.title ?? 'Работы мастера';

  const captureOrder = () => {
    const snapshot = items.map((item) => ({ ...item }));
    const goods = snapshot.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const services = snapshot.reduce(
      (sum, item) => sum + (item.installService ? item.installService.price * item.quantity : 0),
      0
    );
    setOrderSnapshot(snapshot);
    setOrderTotal(goods + services);
    setOrderBonuses(Math.round(goods * BONUS_RATE_GOODS + services * BONUS_RATE_SERVICE));
  };

  const persistOrder = (status: string) => {
    void saveOrderMemory(user.id, {
      id: orderId,
      category: orderCategory,
      address,
      timeWindow,
      status,
      masterName: selectedMaster.name,
      total: currentTotal,
      items: currentItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        install: Boolean(item.installService),
      })),
    });
  };

  useEffect(() => {
    if (step !== 2 && step !== 4) return;
    const status = STEPS[step - 1].title;
    persistOrder(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleStartMasterSearch = () => {
    setSearching(true);
    window.setTimeout(() => {
      setSelectedMaster(MASTERS[0]);
      setSearching(false);
      setStep(3);
    }, 1200);
  };

  useEffect(() => {
    if (step !== 3 || chat.length > 0) return;
    setChat([
      {
        role: 'master',
        text: `Здравствуйте! Я ${selectedMaster.name}. Вижу заявку «${orderCategory}». Пришлите фото маркировки или размеры — уточню, всё ли подходит, и согласуем смету.`,
        createdAt: nowIso(),
      },
    ]);
  }, [step, chat.length, selectedMaster.name, orderCategory]);

  useEffect(() => {
    if (step !== 9 || rewarded) return;
    const snapshot = orderSnapshot.length > 0 ? orderSnapshot : items;
    const bonuses =
      orderBonuses ||
      Math.round(
        snapshot.reduce((sum, item) => sum + item.product.price * item.quantity, 0) *
          BONUS_RATE_GOODS +
          snapshot.reduce(
            (sum, item) => sum + (item.installService ? item.installService.price * item.quantity : 0),
            0
          ) *
            BONUS_RATE_SERVICE
      );

    setRewarded(true);
    addBonuses(bonuses);

    const saveOrder = async () => {
      await saveOrderMemory(user.id, {
        id: orderId,
        category: orderCategory,
        address,
        timeWindow,
        status: 'завершён',
        masterName: selectedMaster.name,
        total: currentTotal,
        items: snapshot.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          install: Boolean(item.installService),
        })),
      });
    };
    void saveOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, rewarded]);

  const handlePhotos = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const urls = Array.from(files)
      .slice(0, 3)
      .map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...urls].slice(0, 3));
    setPhotoHint('Похоже на сантехнику — подсказали категорию и мастера');
    setCategory('santekhnika');
  };

  const sendChat = async (preset?: string) => {
    const value = (preset ?? chatInput).trim();
    if (!value || chatBusy) return;
    setChatInput('');
    setChatBusy(true);

    const clientMessage: ChatMessage = { role: 'client', text: value, createdAt: nowIso() };
    const withClient = [...chat, clientMessage];
    setChat(withClient);

    const hits = await searchUserMemory(user.id, value, 5);
    const facts = (hits ?? [])
      .map((hit) => hit.memory || hit.chunk || '')
      .filter((fact) => Boolean(fact));

    let reply = '';
    let nextSuggestion: Product | null = null;

    if (/замен|дешев|аналог/i.test(value)) {
      const current = currentItems[0]?.product;
      const alternative = current
        ? allProducts.find(
            (product) =>
              product.category === current.category &&
              product.id !== current.id &&
              product.price < current.price
          )
        : null;
      if (current && alternative) {
        nextSuggestion = alternative;
        reply = `Могу заменить «${current.name}» на «${alternative.name}» за ${formatBYN(
          alternative.price
        )}. Характеристики подходят, установка сохраняется. Заменить?`;
      } else {
        reply = 'По этой позиции дешевле аналога нет, но могу подобрать другой вариант после фото.';
      }
    } else if (/фото|размер|марк|модел/i.test(value)) {
      reply =
        'Пришлите, пожалуйста, фото маркировки или замеры. Я проверю совместимость и сразу обновлю смету.';
    } else {
      const memoryLine = facts[0] ? `Помню из прошлых обращений: ${facts[0]}. ` : '';
      reply = `${memoryLine}Принял. Уточню детали у поставщика и подтвержу смету в течение пары минут.`;
    }

    setSuggestion(nextSuggestion);
    const withMaster = [
      ...withClient,
      { role: 'master' as const, text: reply, createdAt: nowIso() },
    ];
    setChat(withMaster);
    setChatBusy(false);
    void saveChatTranscript(user.id, orderId, withMaster);
  };

  const applySuggestion = () => {
    const current = currentItems[0]?.product;
    if (!current || !suggestion) return;
    replaceProductInCart(current.id, suggestion);
    const message: ChatMessage = {
      role: 'master',
      text: `Готово: заменил «${current.name}» на «${suggestion.name}». Смета пересчитана.`,
      createdAt: nowIso(),
    };
    const next = [...chat, message];
    setChat(next);
    setSuggestion(null);
    void saveChatTranscript(user.id, orderId, next);
  };

  const addSupply = () => {
    const supply =
      allProducts.find((product) => /герметик/i.test(product.name)) ??
      allProducts.find((product) => /лента/i.test(product.name));
    if (!supply) return;
    addToCart(supply, 1, false);
    const message: ChatMessage = {
      role: 'master',
      text: `Добавил в корзину расходник «${supply.name}» — он понадобится для монтажа.`,
      createdAt: nowIso(),
    };
    const next = [...chat, message];
    setChat(next);
    void saveChatTranscript(user.id, orderId, next);
  };

  const verifyPin = () => {
    if (pin.trim() === '1234') {
      setPinError(false);
      setTrip('working');
    } else {
      setPinError(true);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setPhotos([]);
    setChat([]);
    setSuggestion(null);
    setClientAgreed(false);
    setPaid(false);
    setTrip('idle');
    setPin('');
    setPinError(false);
    setAccepted(false);
    setBeforePhoto(false);
    setAfterPhoto(false);
    setRewarded(false);
    setReviewSent(false);
    setRating(5);
    setOrderSnapshot([]);
    setOrderTotal(0);
    setOrderBonuses(0);
    setOrderId(`ord_${Date.now().toString(36)}`);
  };

  const stepMeta = STEPS[step - 1];

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-oma-border shadow-card p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-[11px] font-semibold text-oma-text-secondary uppercase tracking-wide">
            Быстрый переключатель шагов
          </div>
          <div className="text-[11px] text-oma-text-secondary">
            Шаг {step} из 9 · {stepMeta.title}
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
          {STEPS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setStep(item.id);
                if (item.id >= 4 && orderSnapshot.length === 0) captureOrder();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`py-2 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer ${
                step === item.id
                  ? 'bg-oma-blue text-white'
                  : step > item.id
                  ? 'bg-oma-blue-tint text-oma-blue'
                  : 'bg-oma-surface-alt text-oma-text-secondary hover:text-oma-text'
              }`}
              title={item.hint}
            >
              {item.id}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
        <section className="bg-white rounded-2xl border border-oma-border shadow-card overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-oma-border flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold text-oma-blue uppercase tracking-wide">
                Шаг {step} · {stepMeta.title}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-oma-text mt-1">{stepMeta.hint}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-oma-blue-tint text-oma-blue flex items-center justify-center shrink-0">
              {step === 1 && <Camera className="w-5 h-5" />}
              {step === 2 && <Sparkles className="w-5 h-5" />}
              {step === 3 && <MessageCircle className="w-5 h-5" />}
              {step === 4 && <FileIcon />}
              {step === 5 && <CreditCard className="w-5 h-5" />}
              {step === 6 && <Truck className="w-5 h-5" />}
              {step === 7 && <MapPin className="w-5 h-5" />}
              {step === 8 && <CheckCircle2 className="w-5 h-5" />}
              {step === 9 && <BadgeCheck className="w-5 h-5" />}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="sm:col-span-3 rounded-2xl border border-dashed border-oma-border bg-oma-bg p-4 cursor-pointer hover:border-oma-blue transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => handlePhotos(event.target.files)}
                    />
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white text-oma-blue flex items-center justify-center border border-oma-border">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-oma-text">
                          Фото или видео места работ
                        </div>
                        <div className="text-[11px] text-oma-text-secondary">
                          {photos.length > 0
                            ? `Загружено ${photos.length} файл(а)`
                            : 'Нажмите, чтобы прикрепить'}
                        </div>
                      </div>
                    </div>
                  </label>
                  {photos.length > 0 && (
                    <div className="sm:col-span-3 flex gap-2">
                      {photos.map((photo) => (
                        <img
                          key={photo}
                          src={photo}
                          alt="Фото заявки"
                          className="w-16 h-16 rounded-xl object-cover border border-oma-border"
                        />
                      ))}
                    </div>
                  )}
                  {photoHint && (
                    <div className="sm:col-span-3 text-[11px] text-oma-blue bg-oma-blue-tint px-3 py-2 rounded-xl">
                      {photoHint}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-oma-text-secondary mb-1">
                      Категория работ
                    </label>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="w-full px-3 py-2.5 bg-oma-bg border border-oma-border rounded-xl text-xs font-semibold text-oma-text"
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-oma-text-secondary mb-1">
                      Адрес
                    </label>
                    <input
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      className="w-full px-3 py-2.5 bg-oma-bg border border-oma-border rounded-xl text-xs text-oma-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-oma-text-secondary mb-1">
                      Окно времени
                    </label>
                    <input
                      value={timeWindow}
                      onChange={(event) => setTimeWindow(event.target.value)}
                      className="w-full px-3 py-2.5 bg-oma-bg border border-oma-border rounded-xl text-xs text-oma-text"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-oma-text-secondary mb-1">
                      Комментарий мастеру
                    </label>
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      rows={2}
                      placeholder="Что нужно сделать, какие есть ограничения"
                      className="w-full px-3 py-2.5 bg-oma-bg border border-oma-border rounded-xl text-xs text-oma-text resize-none"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-oma-bg border border-oma-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-oma-text">Товары из корзины</div>
                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="text-[11px] font-semibold text-oma-blue cursor-pointer"
                    >
                      Открыть корзину
                    </button>
                  </div>
                  {items.length === 0 ? (
                    <div className="text-[11px] text-oma-text-secondary">
                      Корзина пуста — можно вызвать мастера только для работ, товары добавит мастер.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-oma-text truncate pr-3">
                            {item.product.name} × {item.quantity}
                          </span>
                          <span className="text-oma-text-secondary shrink-0">
                            {item.installService ? 'с установкой' : 'без установки'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    captureOrder();
                    persistOrder('Заявка');
                    setStep(2);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-oma-blue hover:bg-oma-blue-hover text-white text-sm font-semibold rounded-xl inline-flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Создать заявку</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="p-5 rounded-2xl bg-oma-blue-tint border border-oma-blue/20">
                  <div className="text-[11px] font-semibold text-oma-blue uppercase tracking-wide">
                    Ориентир стоимости
                  </div>
                  <div className="text-3xl font-extrabold text-oma-text mt-1">{estimate}</div>
                  <div className="text-xs text-oma-text-secondary mt-1">
                    Точная смета фиксируется после диагностики и согласования с мастером.
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-oma-bg border border-oma-border">
                    <div className="text-oma-text-secondary text-[10px]">Товары</div>
                    <div className="font-bold text-oma-text mt-1">{formatBYN(goodsTotal)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-oma-bg border border-oma-border">
                    <div className="text-oma-text-secondary text-[10px]">Установка</div>
                    <div className="font-bold text-oma-text mt-1">{formatBYN(servicesTotal)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-oma-bg border border-oma-border">
                    <div className="text-oma-text-secondary text-[10px]">Бонусы</div>
                    <div className="font-bold text-oma-blue mt-1">+{currentBonuses} Б</div>
                  </div>
                </div>
                {searching && (
                  <div className="p-4 rounded-xl bg-oma-blue-tint border border-oma-blue/30 flex items-center space-x-3 animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-oma-blue text-white flex items-center justify-center shrink-0">
                      <Timer className="w-5 h-5 animate-spin" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-oma-text">
                        Система подбирает ближайшего мастера (как в Яндекс)…
                      </div>
                      <div className="text-[11px] text-oma-text-secondary">
                        Район: {address} · Категория: «{orderCategory}» · Рейтинг 4.8+
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleStartMasterSearch}
                  disabled={searching}
                  className="px-6 py-3 bg-oma-blue hover:bg-oma-blue-hover disabled:bg-oma-blue/60 text-white text-sm font-semibold rounded-xl inline-flex items-center space-x-2 cursor-pointer"
                >
                  {searching ? (
                    <>
                      <span>Система подбирает мастера…</span>
                      <Timer className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>Найти мастера системой</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <div className="p-3.5 rounded-xl bg-oma-surface-alt border border-oma-border flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-oma-blue text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {selectedMaster.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-oma-text">{selectedMaster.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-oma-blue-tint text-oma-blue">
                          Назначен системой
                        </span>
                      </div>
                      <div className="text-[11px] text-oma-text-secondary mt-0.5">
                        {selectedMaster.distance} · {selectedMaster.eta} · {selectedMaster.jobs} выполненных работ
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-oma-text flex items-center space-x-1 justify-end">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{selectedMaster.rating}</span>
                    </div>
                    <div className="text-[10px] text-oma-text-secondary">рейтинг ОМА</div>
                  </div>
                </div>

                <div className="h-56 overflow-y-auto space-y-2 p-3 rounded-xl bg-oma-bg border border-oma-border">
                  {chat.map((message, index) => (
                    <div
                      key={`${message.createdAt}-${index}`}
                      className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed ${
                        message.role === 'client'
                          ? 'ml-auto bg-oma-blue text-white'
                          : 'bg-white border border-oma-border text-oma-text'
                      }`}
                    >
                      {message.text}
                    </div>
                  ))}
                  {chatBusy && (
                    <div className="text-[11px] text-oma-text-secondary">Мастер печатает…</div>
                  )}
                </div>

                {suggestion && (
                  <div className="p-3 rounded-xl bg-oma-blue-tint border border-oma-blue/20 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-oma-text">
                      Заменить на <b>{suggestion.name}</b> · {formatBYN(suggestion.price)}
                    </div>
                    <button
                      onClick={applySuggestion}
                      className="px-3 py-1.5 rounded-lg bg-oma-blue text-white text-[11px] font-semibold cursor-pointer"
                    >
                      Заменить
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {['Пришлите фото маркировки', 'Есть более дешёвый аналог?', 'Добавьте герметик'].map(
                    (preset) => (
                      <button
                        key={preset}
                        onClick={() => void sendChat(preset)}
                        className="px-2.5 py-1.5 rounded-lg bg-oma-surface-alt text-[11px] text-oma-text-secondary hover:text-oma-text cursor-pointer"
                      >
                        {preset}
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') void sendChat();
                    }}
                    placeholder="Написать мастеру…"
                    className="flex-1 px-3 py-2.5 bg-oma-bg border border-oma-border rounded-xl text-xs text-oma-text"
                  />
                  <button
                    onClick={() => void sendChat()}
                    className="w-10 h-10 rounded-xl bg-oma-blue text-white flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={addSupply}
                    className="px-3 py-2 rounded-xl bg-oma-surface-alt text-[11px] font-semibold text-oma-text cursor-pointer"
                  >
                    + Добавить расходник
                  </button>
                  {items[0] && (
                    <button
                      onClick={() => onOpenProduct(items[0].product)}
                      className="px-3 py-2 rounded-xl bg-oma-surface-alt text-[11px] font-semibold text-oma-text cursor-pointer"
                    >
                      Открыть товар
                    </button>
                  )}
                  <button
                    onClick={() => {
                      captureOrder();
                      setStep(4);
                    }}
                    className="ml-auto px-5 py-2.5 rounded-xl bg-oma-blue text-white text-xs font-semibold inline-flex items-center space-x-2 cursor-pointer"
                  >
                    <span>К согласованию</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="rounded-2xl border border-oma-border overflow-hidden">
                  <div className="p-3 bg-oma-bg text-xs font-semibold text-oma-text">Сводка заказа</div>
                  <div className="divide-y divide-oma-border">
                    <SummaryRow label="Работы" value={orderCategory} />
                    <SummaryRow label="Мастер" value={selectedMaster.name} />
                    <SummaryRow label="Срок" value="Сегодня, 2–3 часа" />
                    <SummaryRow label="Адрес" value={address} />
                    <SummaryRow label="Товары и установка" value={formatBYN(currentTotal)} />
                    <SummaryRow label="Бонусы" value={`+${currentBonuses} Б`} accent />
                  </div>
                </div>
                <label className="flex items-center space-x-2 text-xs text-oma-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clientAgreed}
                    onChange={(event) => setClientAgreed(event.target.checked)}
                    className="w-4 h-4 accent-[#005DD6]"
                  />
                  <span>Клиент согласен со сметой и сроком</span>
                </label>
                <div className="flex items-center space-x-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                  <Check className="w-3.5 h-3.5" />
                  <span>Мастер подтвердил смету</span>
                </div>
                <button
                  disabled={!clientAgreed}
                  onClick={() => setStep(5)}
                  className="px-6 py-3 bg-oma-blue hover:bg-oma-blue-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl inline-flex items-center space-x-2 cursor-pointer"
                >
                  <span>Перейти к оплате</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 5 && (
              <>
                <div className="p-5 rounded-2xl bg-oma-blue-tint border border-oma-blue/20">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-oma-blue">
                    <Lock className="w-4 h-4" />
                    <span>Safe Deal</span>
                  </div>
                  <div className="text-2xl font-extrabold text-oma-text mt-2">
                    {formatBYN(currentTotal)}
                  </div>
                  <p className="text-[11px] text-oma-text-secondary mt-1">
                    Деньги замораживаются на карте и списываются только после приёмки работ.
                  </p>
                </div>
                {!paid ? (
                  <button
                    onClick={() => setPaid(true)}
                    className="px-6 py-3 bg-oma-blue hover:bg-oma-blue-hover text-white text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    Заблокировать сумму
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-xs font-semibold text-emerald-800 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Средства захолдированы</span>
                    </div>
                    <button
                      onClick={() => setStep(6)}
                      className="px-4 py-2 rounded-xl bg-oma-blue text-white text-xs font-semibold cursor-pointer"
                    >
                      К логистике
                    </button>
                  </div>
                )}
              </>
            )}

            {step === 6 && (
              <>
                <div className="space-y-2">
                  {[
                    ['delivery', 'Доставка ОМА', 'Материалы привезёт ОМА к началу работ'],
                    ['pickup', 'Самовывоз мастером', 'Мастер заберёт заказ в магазине'],
                  ].map(([id, title, hint]) => (
                    <button
                      key={id}
                      onClick={() => setLogistics(id as typeof logistics)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                        logistics === id
                          ? 'border-oma-blue bg-oma-blue-tint'
                          : 'border-oma-border bg-white hover:border-oma-blue'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Truck className="w-4 h-4 text-oma-blue" />
                        <div>
                          <div className="text-xs font-semibold text-oma-text">{title}</div>
                          <div className="text-[11px] text-oma-text-secondary">{hint}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(7)}
                  className="px-6 py-3 bg-oma-blue hover:bg-oma-blue-hover text-white text-sm font-semibold rounded-xl inline-flex items-center space-x-2 cursor-pointer"
                >
                  <span>Подтвердить логистику</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 7 && (
              <>
                <div className="space-y-2">
                  <TripRow
                    active={trip !== 'idle'}
                    title="Мастер в пути"
                    hint="Дмитрий выехал, ожидаемое время 15 минут"
                  />
                  <TripRow
                    active={trip === 'arrived' || trip === 'working'}
                    title="Мастер на месте"
                    hint="Можно начинать работы после ПИН-кода"
                  />
                  <TripRow
                    active={trip === 'working'}
                    title="Работы начаты"
                    hint="ПИН-код подтверждён"
                  />
                </div>
                {trip === 'idle' && (
                  <button
                    onClick={() => setTrip('on_way')}
                    className="px-6 py-3 bg-oma-blue hover:bg-oma-blue-hover text-white text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    Мастер выехал
                  </button>
                )}
                {trip === 'on_way' && (
                  <button
                    onClick={() => setTrip('arrived')}
                    className="px-6 py-3 bg-oma-blue hover:bg-oma-blue-hover text-white text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    Мастер на месте
                  </button>
                )}
                {trip === 'arrived' && (
                  <div className="p-3.5 rounded-xl bg-oma-bg border border-oma-border">
                    <div className="text-xs font-semibold text-oma-text mb-2">
                      ПИН-код клиента для старта работ
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        value={pin}
                        onChange={(event) => setPin(event.target.value)}
                        placeholder="1234"
                        className="w-28 px-3 py-2 bg-white border border-oma-border rounded-xl text-xs text-oma-text"
                      />
                      <button
                        onClick={verifyPin}
                        className="px-4 py-2 rounded-xl bg-oma-blue text-white text-xs font-semibold cursor-pointer"
                      >
                        Подтвердить
                      </button>
                      {pinError && (
                        <span className="text-[11px] text-red-600">Неверный код (1234)</span>
                      )}
                    </div>
                  </div>
                )}
                {trip === 'working' && (
                  <button
                    onClick={() => setStep(8)}
                    className="px-6 py-3 bg-oma-blue hover:bg-oma-blue-hover text-white text-sm font-semibold rounded-xl inline-flex items-center space-x-2 cursor-pointer"
                  >
                    <span>К приёмке работ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            {step === 8 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <PhotoCheck
                    label="Фото «до»"
                    done={beforePhoto}
                    onClick={() => setBeforePhoto(true)}
                  />
                  <PhotoCheck
                    label="Фото «после»"
                    done={afterPhoto}
                    onClick={() => setAfterPhoto(true)}
                  />
                </div>
                <div className="p-3.5 rounded-xl bg-oma-bg border border-oma-border text-[11px] text-oma-text-secondary">
                  Автоприёмка через 24 часа, если клиент не подтвердит. Дополнительные работы — только
                  через приложение.
                </div>
                <button
                  disabled={!beforePhoto || !afterPhoto}
                  onClick={() => {
                    setAccepted(true);
                    setStep(9);
                  }}
                  className="px-6 py-3 bg-oma-blue hover:bg-oma-blue-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl inline-flex items-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Подтвердить приёмку</span>
                </button>
              </>
            )}

            {step === 9 && (
              <>
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2">
                    <BadgeCheck className="w-6 h-6" />
                  </div>
                  <div className="text-lg font-bold text-emerald-900">Заказ завершён</div>
                  <div className="text-xs text-emerald-800 mt-1">
                    Мастеру выплачено, бонусы начислены. Гарантия на работы — 12 месяцев.
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-900 mt-3">+{currentBonuses} Б</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-oma-border">
                  <div className="text-xs font-semibold text-oma-text mb-2">Оцените мастера</div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => setRating(value)}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            value <= rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-oma-border'
                          }`}
                        />
                      </button>
                    ))}
                    <button
                      onClick={() => setReviewSent(true)}
                      className="ml-3 px-3 py-1.5 rounded-lg bg-oma-surface-alt text-[11px] font-semibold text-oma-text cursor-pointer"
                    >
                      {reviewSent ? 'Отзыв отправлен' : 'Отправить отзыв'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={onBackToCatalog}
                    className="px-6 py-3 bg-oma-blue hover:bg-oma-blue-hover text-white text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    Вернуться в каталог
                  </button>
                  <button
                    onClick={resetFlow}
                    className="px-6 py-3 bg-oma-surface-alt text-oma-text text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    Новый заказ
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        <aside className="space-y-3 xl:sticky xl:top-24">
          <div className="p-4 rounded-2xl bg-white border border-oma-border shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-oma-text">Ваш заказ</div>
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-[11px] font-semibold text-oma-blue cursor-pointer"
              >
                Корзина
              </button>
            </div>
            {currentItems.length === 0 ? (
              <div className="text-[11px] text-oma-text-secondary">
                Добавьте товары из каталога.
              </div>
            ) : (
              <div className="space-y-1.5">
                {currentItems.map((item) => (
                  <div key={item.product.id} className="flex items-start justify-between gap-2 text-[11px]">
                    <span className="text-oma-text leading-snug">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="text-oma-text-secondary shrink-0">
                      {formatBYN(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-oma-border flex items-center justify-between">
              <span className="text-[11px] text-oma-text-secondary">Итого</span>
              <span className="text-sm font-bold text-oma-text">{formatBYN(currentTotal)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[11px] text-oma-text-secondary">Бонусы</span>
              <span className="text-xs font-bold text-oma-blue">+{currentBonuses} Б</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-oma-border shadow-card">
            <div className="text-xs font-bold text-oma-text mb-2">Мастер</div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-oma-blue text-white text-[10px] font-bold flex items-center justify-center">
                {selectedMaster.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </div>
              <div>
                <div className="text-[11px] font-semibold text-oma-text">{selectedMaster.name}</div>
                <div className="text-[10px] text-oma-text-secondary">
                  {selectedMaster.rating} ★ · {selectedMaster.eta}
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-oma-text-secondary flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-oma-blue" />
              <span>Автоподбор системой ОМА (Яндекс-модель)</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value: string; accent?: boolean }> = ({
  label,
  value,
  accent,
}) => (
  <div className="flex items-center justify-between px-3 py-2.5 text-xs">
    <span className="text-oma-text-secondary">{label}</span>
    <span className={`font-semibold ${accent ? 'text-oma-blue' : 'text-oma-text'}`}>{value}</span>
  </div>
);

const TripRow: React.FC<{ active: boolean; title: string; hint: string }> = ({
  active,
  title,
  hint,
}) => (
  <div
    className={`p-3 rounded-xl border flex items-center space-x-3 ${
      active ? 'border-oma-blue bg-oma-blue-tint' : 'border-oma-border bg-white'
    }`}
  >
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center ${
        active ? 'bg-oma-blue text-white' : 'bg-oma-surface-alt text-oma-text-secondary'
      }`}
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
    </div>
    <div>
      <div className="text-xs font-semibold text-oma-text">{title}</div>
      <div className="text-[11px] text-oma-text-secondary">{hint}</div>
    </div>
  </div>
);

const PhotoCheck: React.FC<{ label: string; done: boolean; onClick: () => void }> = ({
  label,
  done,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-xl border-2 border-dashed text-center transition-colors cursor-pointer ${
      done ? 'border-emerald-400 bg-emerald-50' : 'border-oma-border bg-oma-bg hover:border-oma-blue'
    }`}
  >
    <Camera className={`w-5 h-5 mx-auto ${done ? 'text-emerald-600' : 'text-oma-text-secondary'}`} />
    <div className="text-xs font-semibold text-oma-text mt-1">
      {done ? `${label} добавлено` : `Добавить ${label.toLowerCase()}`}
    </div>
  </button>
);

const FileIcon: React.FC = () => <Package className="w-5 h-5" />;
