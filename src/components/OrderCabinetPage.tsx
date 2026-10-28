import React, { useState, useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { Dialog, Select } from '@gravity-ui/uikit';
import {
  CircleCheck,
  Clock,
  ShieldCheck,
  Handset,
  Comment,
  StarFill,
  Camera,
  TrashBin,
  ShoppingCart,
  Check,
  ArrowLeft,
} from '@gravity-ui/icons';
import { OrderStatus, Product } from '../types';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { formatBYN } from '../config/loyalty';
import { DateTimeDrawer } from './DateTimeDrawer';
import { saveChatTranscript, ChatMessage } from '../lib/supermemory';
import productsData from '../data/products.json';
import {
  resolveCategoryFlow,
  DEMO_PRESET_ORDERS,
  detectCategoryKey,
  CategoryFlowSpec,
} from '../config/masterCatalogFlow';

const allProducts = productsData as Product[];

export interface ExtraOrderProduct {
  product: Product;
  quantity: number;
}

export interface CabinetOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  serviceTitle: string;
  serviceCategory?: string;
  serviceCategoryLabel?: string;
  serviceId?: string;
  productName?: string;
  materialPhotos?: string[];
  materialDescription?: string;
  sitePhotos?: string[];
  address: string;
  dateTime: string;
  goodsPrice: number;
  servicePrice: number;
  deliveryPrice: number;
  discountBonus: number;
  totalPrice: number;
  earnedBonuses: number;
  master: {
    name: string;
    initials?: string;
    avatar?: string;
    rating: number;
    completedOrders: number;
    phone: string;
    specialty?: string;
    park?: string;
  };
}

interface OrderCabinetPageProps {
  order?: CabinetOrder;
  onBackToHome: () => void;
  onGoToCatalog: () => void;
  onOpenLoyalty: () => void;
}

export const MasterAvatar: React.FC<{
  name: string;
  initials?: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}> = ({ name, avatar = '/master.jpeg', size = 'md', className = '', showBadge = true }) => {
  const sizeStyles = {
    sm: 'w-9 h-9 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-2xl',
  }[size];

  const badgeStyles = {
    sm: 'w-3 h-3 text-[7px]',
    md: 'w-4 h-4 text-[9px]',
    lg: 'w-4.5 h-4.5 text-[10px]',
    xl: 'w-6 h-6 text-xs',
  }[size];

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div className={`${sizeStyles} overflow-hidden bg-[#F4F4F6] border border-[#E2E4E8]`}>
        <img src={avatar || '/master.jpeg'} alt={name} className="w-full h-full object-cover" />
      </div>
      {showBadge && (
        <span
          title="Проверенный мастер ОМА"
          className={`absolute -bottom-1 -right-1 ${badgeStyles} bg-[#2D8B5D] text-white rounded-full flex items-center justify-center ring-2 ring-white font-bold`}
        >
          ✓
        </span>
      )}
    </div>
  );
};

type RichChatMessage = ChatMessage & {
  id: string;
  photoUrl?: string;
  photoCaption?: string;
  widgetType?: 'cart_builder' | 'cart_reserved' | 'cart_paid' | 'final_report' | 'warranty_card';
  reservedData?: {
    items: { name: string; price: number; qty: number; image: string }[];
    extraTotal: number;
    extraBonuses: number;
  };
};

const buildInitialMessages = (spec: CategoryFlowSpec, ord: CabinetOrder): RichChatMessage[] => [
  {
    id: 'm_1',
    role: 'master',
    text: `Здравствуйте! Я ${ord.master.name}, мастер по заказу № ${ord.orderNumber}. Сейчас готовлюсь к выезду в ОМА забрать материалы по вашему заказу: ${ord.productName || ord.serviceTitle}.`,
    createdAt: '13:02',
  },
  {
    id: 'm_1b',
    role: 'master',
    text: spec.sitePhotoPrompt,
    createdAt: '13:02',
  },
];

export const OrderCabinetPage: React.FC<OrderCabinetPageProps> = ({
  order: initialOrder,
  onBackToHome,
  onOpenLoyalty,
}) => {
  const { user, addBonuses } = useUser();
  const { addToCart, removeFromCart } = useCart();

  const [order, setOrder] = useState<CabinetOrder>(() => {
    const base = initialOrder || DEMO_PRESET_ORDERS[0].order;
    return {
      ...base,
      master: {
        ...base.master,
        avatar: base.master.avatar || '/master.jpeg',
        park: base.master.park || 'Парк ОМА',
      },
    };
  });

  // Dynamic flow configuration for the current order & category
  const flowSpec: CategoryFlowSpec = useMemo(() => {
    return resolveCategoryFlow(order, allProducts);
  }, [order]);

  // Separate full-screen view toggle: 'cabinet' | 'chat'
  const [screenMode, setScreenMode] = useState<'cabinet' | 'chat'>('cabinet');
  const [activeStage, setActiveStage] = useState<'departure' | 'final'>('departure');
  const [isMasterTyping, setIsMasterTyping] = useState(false);

  // Modals
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // ---------------------------------------------------------------------------
  // CHAT SCENARIO (linear, no duplicated steps)
  // departure: await_photo → selecting → await_payment → paid → on_site
  // final:     report → accepted → rated
  // ---------------------------------------------------------------------------
  type FlowStep =
    | 'await_photo'
    | 'selecting'
    | 'await_payment'
    | 'paid'
    | 'on_site'
    | 'report'
    | 'accepted'
    | 'rated';

  const [flowStep, setFlowStep] = useState<FlowStep>('await_photo');
  const [analoguesAsked, setAnaloguesAsked] = useState(false);

  // Dynamic step-by-step picker for consumables
  const [wizardStep, setWizardStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>(() => {
    const initialSpec = resolveCategoryFlow(initialOrder || DEMO_PRESET_ORDERS[0].order, allProducts);
    const defs: Record<number, string> = {};
    initialSpec.steps.forEach((st, idx) => {
      defs[idx] = st.defaultProductId || st.options[0]?.value || 'none';
    });
    return defs;
  });

  const [addedOrderExtras, setAddedOrderExtras] = useState<ExtraOrderProduct[]>([]);
  const [cartReservedInStore, setCartReservedInStore] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const nowHM = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [chatMessages, setChatMessages] = useState<RichChatMessage[]>(() => {
    const baseOrder = initialOrder || DEMO_PRESET_ORDERS[0].order;
    const initialSpec = resolveCategoryFlow(baseOrder, allProducts);
    return buildInitialMessages(initialSpec, baseOrder);
  });
  const [newMsg, setNewMsg] = useState('');

  // Scroll ONLY the internal chat box, never the whole window
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const chatBottomAnchorRef = useRef<HTMLDivElement>(null);

  const scrollChatBoxToBottom = (_behavior: ScrollBehavior = 'instant') => {
    const el = chatScrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const openChatScreen = (stage?: 'departure' | 'final') => {
    if (stage) setActiveStage(stage);
    setScreenMode('chat');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  // Open chat already scrolled to the end of the last message
  useLayoutEffect(() => {
    if (screenMode !== 'chat') return;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    scrollChatBoxToBottom();
    const t1 = setTimeout(scrollChatBoxToBottom, 30);
    const t2 = setTimeout(scrollChatBoxToBottom, 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [screenMode, activeStage]);

  // Keep the newest message in view
  useEffect(() => {
    if (screenMode !== 'chat') return;
    const t = setTimeout(scrollChatBoxToBottom, 40);
    return () => clearTimeout(t);
  }, [chatMessages.length, isMasterTyping, wizardStep, screenMode]);

  // Append messages: optional client message now, master reply after "typing"
  const pushExchange = (
    clientMsg: Omit<RichChatMessage, 'id' | 'createdAt' | 'role'> | null,
    masterMsgs: Omit<RichChatMessage, 'id' | 'createdAt' | 'role'>[],
    delay = 900
  ) => {
    if (clientMsg) {
      setChatMessages((prev) => [
        ...prev,
        { ...clientMsg, id: 'c_' + Date.now(), role: 'client', createdAt: nowHM() } as RichChatMessage,
      ]);
    }
    if (masterMsgs.length === 0) return;
    setIsMasterTyping(true);
    setTimeout(() => {
      setChatMessages((prev) => {
        const next = [
          ...prev,
          ...masterMsgs.map(
            (m, i) =>
              ({ ...m, id: `m_${Date.now()}_${i}`, role: 'master', createdAt: nowHM() }) as RichChatMessage
          ),
        ];
        if (user?.id) void saveChatTranscript(user.id, order.id, next);
        return next;
      });
      setIsMasterTyping(false);
    }, delay);
  };

  // Calculate live total for selected consumables
  const coCartSummary = useMemo(() => {
    let sum = 0;
    const picked: { product: Product; qty: number; tag: string; note: string }[] = [];
    flowSpec.steps.forEach((step, idx) => {
      const chosenVal = selectedOptions[idx] ?? step.defaultProductId;
      if (!chosenVal || chosenVal === 'none') return;
      const opt = step.options.find((o) => o.value === chosenVal);
      if (!opt || opt.value === 'none') return;
      const p = allProducts.find((x) => x.id === opt.value);
      if (!p) return;
      picked.push({ product: p, qty: 1, tag: opt.tag, note: opt.note });
      sum += p.price;
    });
    return {
      totalPrice: Number(sum.toFixed(2)),
      totalCount: picked.length,
      extraBonuses: Math.max(1, Math.round(sum * 0.08)),
      picked,
    };
  }, [flowSpec, selectedOptions]);

  // STEP 1 → client sends photo, master analyses and starts step-by-step picker
  const handleSendNodePhoto = () => {
    if (flowStep !== 'await_photo') return;
    setFlowStep('selecting');
    setWizardStep(0);
    pushExchange(
      {
        text: 'Вот фото места работ.',
        photoUrl: '/master/your_photo.svg',
        photoCaption: flowSpec.clientPhotoCaption,
      },
      [
        {
          text: flowSpec.photoAnalysisReply,
          widgetType: 'cart_builder',
        },
      ],
      1100
    );
  };

  // Optional one-time question about domestic vs imported analogues
  const handleAskAnalogues = () => {
    if (analoguesAsked) return;
    setAnaloguesAsked(true);
    pushExchange(
      { text: flowSpec.analoguesQuestion },
      [
        {
          text: flowSpec.analoguesReply,
        },
      ],
      1200
    );
  };

  // Client skips extra materials
  const handleSkipMaterials = () => {
    if (flowStep !== 'selecting') return;
    setFlowStep('paid');
    pushExchange({ text: 'Спасибо, ничего докупать не буду — все расходники уже есть.' }, [
      {
        text: `Хорошо, тогда забираю только ${order.productName || 'основной заказ'} и выезжаю к вам. Буду примерно через 30 минут.`,
      },
    ]);
  };

  // STEP 2 → selected items go to OMA cart, client gets a payment widget
  const handleAddItemsToOmaCart = () => {
    if (flowStep !== 'selecting' || coCartSummary.totalCount === 0) return;
    coCartSummary.picked.forEach((item) => addToCart(item.product, item.qty, false));
    setFlowStep('await_payment');
    setCartReservedInStore(true);

    pushExchange(
      {
        text: `Добавил в корзину ОМА ${coCartSummary.totalCount} поз. на ${formatBYN(coCartSummary.totalPrice)}`,
        widgetType: 'cart_reserved',
        reservedData: {
          items: coCartSummary.picked.map((p) => ({
            name: p.product.name,
            price: p.product.price,
            qty: p.qty,
            image: p.product.image,
          })),
          extraTotal: coCartSummary.totalPrice,
          extraBonuses: coCartSummary.extraBonuses,
        },
      },
      [
        {
          text: 'Вижу сформированную бронь. Как оплатите — магазин соберёт пакет на стойке выдачи, я заберу его по пути к вам.',
        },
      ]
    );
  };

  // STEP 3 → payment (mock) for the extra items; result goes to chat
  const handleConfirmPayment = () => {
    if (flowStep !== 'await_payment' || paymentProcessing) return;
    setPaymentProcessing(true);
    setTimeout(() => {
      coCartSummary.picked.forEach((item) => removeFromCart(item.product.id));
      setAddedOrderExtras((prev) => {
        const next = [...prev];
        coCartSummary.picked.forEach((item) => {
          const idx = next.findIndex((x) => x.product.id === item.product.id);
          if (idx >= 0) next[idx] = { ...next[idx], quantity: next[idx].quantity + item.qty };
          else next.push({ product: item.product, quantity: item.qty });
        });
        return next;
      });
      setOrder((prev) => ({
        ...prev,
        goodsPrice: Number((prev.goodsPrice + coCartSummary.totalPrice).toFixed(2)),
        totalPrice: Number((prev.totalPrice + coCartSummary.totalPrice).toFixed(2)),
        earnedBonuses: prev.earnedBonuses + coCartSummary.extraBonuses,
      }));
      setCartReservedInStore(false);
      setPaymentProcessing(false);
      setPaymentDialogOpen(false);
      setFlowStep('paid');

      pushExchange(
        {
          text: `Оплатил ${formatBYN(coCartSummary.totalPrice)} картой через корзину ОМА.`,
          widgetType: 'cart_paid',
          reservedData: {
            items: coCartSummary.picked.map((p) => ({
              name: p.product.name,
              price: p.product.price,
              qty: p.qty,
              image: p.product.image,
            })),
            extraTotal: coCartSummary.totalPrice,
            extraBonuses: coCartSummary.extraBonuses,
          },
        },
        [
          {
            text: 'Оплата пришла, бронь подтверждена. Пакет с расходниками уже забрал на стойке ОМА. Выезжаю к вам, буду примерно через 30 минут. Подскажите код домофона и этаж?',
          },
        ],
        1200
      );
    }, 900);
  };

  // STEP 4 → address details, master arrives
  const handleSendIntercom = () => {
    if (flowStep !== 'paid') return;
    setFlowStep('on_site');
    pushExchange({ text: 'Домофон 42, 4 этаж. Все подготовил к вашему приходу.' }, [
      { text: 'Принял. Подъезжаю — буду через 5 минут.' },
    ]);
  };

  // FINAL stage: report once
  const handleSelectStage = (stage: 'departure' | 'final') => {
    setActiveStage(stage);
    if (stage !== 'final') return;
    setOrder((prev) => (prev.status === 'on_the_way' ? { ...prev, status: 'acceptance' } : prev));
    if (flowStep === 'report' || flowStep === 'accepted' || flowStep === 'rated') return;
    setFlowStep('report');
    pushExchange(null, [
      {
        text: flowSpec.finalReportText,
        widgetType: 'final_report',
      },
    ]);
  };

  const handleAcceptWork = () => {
    if (flowStep !== 'report') return;
    setFlowStep('accepted');
    setOrder((prev) => ({ ...prev, status: 'review' }));
    pushExchange({ text: 'Проверил: работа выполнена качественно и аккуратно. Принимаю.' }, [
      {
        text: 'Спасибо! Оплата за работу переведена, а на материалы ОМА и монтаж действует гарантия 12 месяцев:',
        widgetType: 'warranty_card',
      },
    ]);
  };

  const handleRate5 = () => {
    if (flowStep !== 'accepted') return;
    setFlowStep('rated');
    if (!reviewSubmitted) {
      setReviewSubmitted(true);
      addBonuses(order.earnedBonuses);
    }
    pushExchange({ text: 'Ставлю 5 ★. Спасибо за честный совет и отличную работу!' }, [
      { text: `Спасибо вам! Бонусы +${order.earnedBonuses} Б уже на карте «Баланс». Если возникнут вопросы — пишите сюда.` },
    ]);
  };

  const handleSendMessage = (textToSend?: string, photoAttachment?: string) => {
    const text = (textToSend || newMsg).trim();
    if (!text && !photoAttachment) return;
    setNewMsg('');
    if (photoAttachment && flowStep === 'await_photo') {
      setFlowStep('selecting');
      setWizardStep(0);
      pushExchange({ text: text || 'Фото места установки', photoUrl: photoAttachment }, [
        {
          text: flowSpec.photoAnalysisReply,
          widgetType: 'cart_builder',
        },
      ]);
      return;
    }
    pushExchange({ text: text || 'Фото', photoUrl: photoAttachment }, [
      { text: 'Принял, учту.' },
    ]);
  };

  const chipPrimary =
    'px-3 py-1.5 rounded-xl bg-[#EDF4FF] text-[#005DD6] text-xs font-semibold hover:bg-[#005DD6]/15 transition-colors cursor-pointer';
  const chipSecondary =
    'px-3 py-1.5 rounded-xl bg-[#F4F4F6] text-[#111111] text-xs font-medium hover:bg-[#E2E4E8] transition-colors cursor-pointer';
  const chipSuccess =
    'px-3 py-1.5 rounded-xl bg-[#2D8B5D]/10 text-[#2D8B5D] text-xs font-semibold hover:bg-[#2D8B5D]/20 transition-colors cursor-pointer';

  const handleMaterialPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const res = ev.target?.result as string;
        if (res) {
          setOrder((prev) => ({
            ...prev,
            materialPhotos: [...(prev.materialPhotos || []), res],
          }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const currentCategoryKey = order.serviceCategory || detectCategoryKey(order);

  // ============================================================================
  // DEDICATED FULL-SCREEN CHAT VIEW (Responsive, No Auto-Page-Scroll Down)
  // ============================================================================
  if (screenMode === 'chat') {
    return (
      <div className="pb-10 space-y-4 sm:space-y-5">
        {/* Top Navigation & 2-Step Bar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-[#E2E4E8] flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setScreenMode('cabinet');
                window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
              }}
              className="h-10 px-3.5 rounded-xl bg-[#F4F4F6] hover:bg-[#E2E4E8] text-[#111111] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>К заказу</span>
            </button>

            <MasterAvatar name={order.master.name} avatar={order.master.avatar} size="md" />

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-[#111111] truncate">
                  {order.master.name}
                </h1>
                <span className="inline-block text-[11px] font-medium text-[#005DD6] bg-[#EDF4FF] px-2 py-0.5 rounded-full">
                  {order.master.park || 'Парк ОМА'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2D8B5D] bg-[#2D8B5D]/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D8B5D]" />В сети
                </span>
              </div>
              <p className="text-xs text-[#6e6e73] truncate">
                {order.master.specialty || flowSpec.categoryLabel} · {order.master.rating} ★ · Заказ № {order.orderNumber}
              </p>
            </div>
          </div>

          {/* Clean 2-Step Segmented Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F4F4F6] rounded-2xl border border-[#E2E4E8] w-full md:w-[350px] shrink-0">
            <button
              type="button"
              onClick={() => handleSelectStage('departure')}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeStage === 'departure'
                  ? 'bg-[#005DD6] text-white shadow-xs'
                  : 'text-[#6e6e73] hover:text-[#111111]'
              }`}
            >
              1. Выезд и подбор
            </button>
            <button
              type="button"
              onClick={() => handleSelectStage('final')}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeStage === 'final'
                  ? 'bg-[#2D8B5D] text-white shadow-xs'
                  : 'text-[#6e6e73] hover:text-[#111111]'
              }`}
            >
              2. Финал и приёмка
            </button>
          </div>
        </div>

        {/* Main Responsive 2-Column Chat Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left 8 Cols: Chat Canvas */}
          <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-[#E2E4E8] overflow-hidden flex flex-col h-[560px] sm:h-[640px] lg:h-[680px]">
            {/* Scrollable Messages Area */}
            <div
              ref={chatScrollContainerRef}
              className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 bg-[#F4F4F6]"
            >
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 sm:gap-2.5 ${
                    msg.role === 'client' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'master' && (
                    <MasterAvatar
                      name={order.master.name}
                      avatar={order.master.avatar}
                      size="sm"
                      showBadge={false}
                      className="hidden sm:inline-flex"
                    />
                  )}

                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed w-full sm:max-w-[86%] shadow-xs space-y-3 ${
                      msg.role === 'client'
                        ? 'bg-[#005DD6] text-white rounded-tr-xs sm:w-auto'
                        : 'bg-white text-[#111111] border border-[#E2E4E8] rounded-tl-xs'
                    }`}
                  >
                    {msg.photoUrl && (
                      <div
                        onClick={() => setSelectedPhotoModal(msg.photoUrl || null)}
                        className="rounded-xl overflow-hidden border border-black/10 bg-white cursor-pointer"
                      >
                        <img
                          src={msg.photoUrl}
                          alt="ВАШЕ ФОТО"
                          className="w-full h-44 object-contain bg-white hover:scale-105 transition-transform"
                        />
                        {msg.photoCaption && (
                          <div className="px-3 py-1.5 bg-black/75 text-xs text-white">
                            {msg.photoCaption}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* WIDGET 1: Step-by-step materials picker */}
                    {msg.widgetType === 'cart_builder' && (() => {
                      const isLive = flowStep === 'selecting';
                      const totalSteps = flowSpec.steps.length;

                      if (!isLive) {
                        return (
                          <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E2E4E8] text-xs text-[#6E6E73] flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#2D8B5D]" />
                            <span>Подбор материалов завершён</span>
                          </div>
                        );
                      }

                      const cur = flowSpec.steps[wizardStep];
                      const chosenVal = cur ? (selectedOptions[wizardStep] ?? cur.defaultProductId) : null;
                      const opt = cur ? cur.options.find((o) => o.value === chosenVal) : null;

                      return (
                        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E2E4E8] text-[#111111] space-y-3">
                          {/* Progress bar */}
                          <div className="flex items-center gap-1.5">
                            {[...flowSpec.steps.map((s) => s.stepTitle), 'Итог'].map((t, i) => (
                              <div key={t} className="flex-1">
                                <div
                                  className={`h-1 rounded-full ${
                                    i <= wizardStep ? 'bg-[#005DD6]' : 'bg-[#E2E4E8]'
                                  }`}
                                />
                                <div
                                  className={`mt-1 text-[10px] font-medium truncate ${
                                    i === wizardStep ? 'text-[#005DD6]' : 'text-[#9A9BA1]'
                                  }`}
                                >
                                  {t}
                                </div>
                              </div>
                            ))}
                          </div>

                          {cur && opt ? (
                            <div className="space-y-2.5">
                              <div className="text-xs font-semibold">
                                Шаг {wizardStep + 1} из {totalSteps} · {cur.stepTitle} ({cur.categoryLabel})
                              </div>
                              <Select
                                size="l"
                                width="max"
                                value={[chosenVal || 'none']}
                                onUpdate={(vals) => {
                                  const val = vals[0] || 'none';
                                  setSelectedOptions((prev) => ({ ...prev, [wizardStep]: val }));
                                }}
                                options={cur.options.map((o) => ({ value: o.value, content: o.content }))}
                              />
                              {opt.value !== 'none' ? (
                                <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#E2E4E8]">
                                  {opt.image ? (
                                    <img
                                      src={opt.image}
                                      alt={opt.title}
                                      onClick={() => setSelectedPhotoModal(opt.image)}
                                      className="w-12 h-12 rounded-lg object-contain bg-white border border-[#E2E4E8] p-0.5 shrink-0 cursor-pointer"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-[#F4F4F6] border border-[#E2E4E8] flex items-center justify-center shrink-0 text-xs text-[#6e6e73]">
                                      ОМА
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-semibold truncate">{opt.title}</div>
                                    <div className="text-[11px] text-[#6E6E73] leading-snug mt-0.5">{opt.note}</div>
                                  </div>
                                  <div className="text-sm font-bold shrink-0">{formatBYN(opt.price)}</div>
                                </div>
                              ) : (
                                <div className="p-2.5 bg-white rounded-xl border border-dashed border-[#E2E4E8] text-[11px] text-[#6E6E73]">
                                  {opt.note}
                                </div>
                              )}
                              <div className="flex gap-2">
                                {wizardStep > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setWizardStep((s) => s - 1)}
                                    className="h-10 px-4 rounded-xl bg-white border border-[#E2E4E8] text-xs font-semibold hover:bg-[#F4F4F6] cursor-pointer"
                                  >
                                    Назад
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setWizardStep((s) => s + 1)}
                                  className="flex-1 h-10 rounded-xl bg-[#005DD6] hover:bg-[#004EB8] text-white text-xs font-semibold cursor-pointer"
                                >
                                  {wizardStep < totalSteps - 1 ? 'Далее' : 'К итогу'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              <div className="text-xs font-semibold">Итог подбора материалов</div>
                              {coCartSummary.picked.length > 0 ? (
                                <div className="bg-white rounded-xl border border-[#E2E4E8] divide-y divide-[#F0F1F3]">
                                  {coCartSummary.picked.map((p) => (
                                    <div key={p.product.id} className="flex items-center gap-2.5 p-2.5">
                                      {p.product.image ? (
                                        <img
                                          src={p.product.image}
                                          alt={p.product.name}
                                          className="w-9 h-9 rounded-md object-contain border border-[#E2E4E8] shrink-0"
                                        />
                                      ) : (
                                        <div className="w-9 h-9 rounded-md bg-[#F4F4F6] border border-[#E2E4E8] shrink-0 flex items-center justify-center text-[10px]">
                                          ОМА
                                        </div>
                                      )}
                                      <span className="flex-1 min-w-0 text-xs truncate">{p.product.name}</span>
                                      <span className="text-xs font-semibold shrink-0">
                                        {formatBYN(p.product.price)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-[11px] text-[#6E6E73]">Ничего не выбрано (материалы заказчика).</div>
                              )}
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[#6E6E73] text-xs">
                                  Итого · +{coCartSummary.extraBonuses} Б
                                </span>
                                <span className="font-bold">{formatBYN(coCartSummary.totalPrice)}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setWizardStep(0)}
                                  className="h-10 px-4 rounded-xl bg-white border border-[#E2E4E8] text-xs font-semibold hover:bg-[#F4F4F6] cursor-pointer"
                                >
                                  Изменить
                                </button>
                                <button
                                  type="button"
                                  disabled={coCartSummary.totalCount === 0}
                                  onClick={handleAddItemsToOmaCart}
                                  className="flex-1 h-10 rounded-xl bg-[#005DD6] hover:bg-[#004EB8] disabled:bg-[#E2E4E8] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                  Добавить в корзину ОМА
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* WIDGET 2: Cart formed → pay */}
                    {msg.widgetType === 'cart_reserved' && msg.reservedData && (
                      <div className="p-3 rounded-xl bg-white text-[#111111] space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5">
                            <ShoppingCart className="w-3.5 h-3.5 text-[#005DD6]" /> Корзина ОМА
                          </span>
                          <span>{formatBYN(msg.reservedData.extraTotal)}</span>
                        </div>
                        <div className="space-y-1">
                          {msg.reservedData.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-[#6e6e73]">
                              <span className="truncate pr-2 text-[#111111]">{it.name}</span>
                              <span className="font-semibold shrink-0">{formatBYN(it.price * it.qty)}</span>
                            </div>
                          ))}
                        </div>
                        {flowStep === 'await_payment' ? (
                          <button
                            type="button"
                            onClick={() => setPaymentDialogOpen(true)}
                            className="w-full h-9 rounded-lg bg-[#005DD6] hover:bg-[#004EB8] text-white font-semibold text-xs cursor-pointer"
                          >
                            Оплатить {formatBYN(msg.reservedData.extraTotal)}
                          </button>
                        ) : (
                          <div className="text-[11px] font-semibold text-[#2D8B5D] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Оплачено
                          </div>
                        )}
                      </div>
                    )}

                    {/* WIDGET 2b: Payment receipt */}
                    {msg.widgetType === 'cart_paid' && msg.reservedData && (
                      <div className="p-3 rounded-xl bg-white text-[#111111] space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-[#2D8B5D]">
                          <span className="flex items-center gap-1">
                            <CircleCheck className="w-3.5 h-3.5" /> Оплата прошла
                          </span>
                          <span>{formatBYN(msg.reservedData.extraTotal)}</span>
                        </div>
                        <div className="text-[11px] text-[#6E6E73]">
                          {msg.reservedData.items.length} поз. · выдача мастеру в ОМА · +{msg.reservedData.extraBonuses} Б
                        </div>
                      </div>
                    )}

                    {/* WIDGET 3: Before / After photos */}
                    {msg.widgetType === 'final_report' && (
                      <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E2E4E8] text-[#111111] space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div
                            onClick={() => setSelectedPhotoModal('/master/your_photo.svg')}
                            className="relative rounded-xl overflow-hidden border border-[#E2E4E8] bg-white cursor-pointer"
                          >
                            <img src="/master/your_photo.svg" alt="ВАШЕ ФОТО" className="w-full h-36 object-contain bg-white" />
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-medium">
                              Было · ВАШЕ ФОТО
                            </span>
                          </div>
                          <div
                            onClick={() => setSelectedPhotoModal('/master/result_photo.svg')}
                            className="relative rounded-xl overflow-hidden border border-[#2D8B5D] bg-white cursor-pointer"
                          >
                            <img src="/master/result_photo.svg" alt="РЕЗУЛЬТАТ" className="w-full h-36 object-contain bg-white" />
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-[#2D8B5D] text-white text-[10px] font-medium">
                              Стало · РЕЗУЛЬТАТ
                            </span>
                          </div>
                        </div>
                        {flowStep === 'report' && (
                          <button
                            type="button"
                            onClick={handleAcceptWork}
                            className="w-full py-2.5 px-4 rounded-xl bg-[#2D8B5D] hover:bg-[#24704b] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Принять работу</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* WIDGET 4: Warranty */}
                    {msg.widgetType === 'warranty_card' && (
                      <div className="p-3.5 rounded-2xl bg-[#EDF4FF] border border-[#005DD6]/25 text-[#111111] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#005DD6] flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" /> Гарантия ОМА · 12 месяцев
                          </span>
                          <span className="text-[10px] font-bold bg-[#2D8B5D] text-white px-2 py-0.5 rounded-full">
                            Активна
                          </span>
                        </div>
                        {flowStep === 'accepted' && (
                          <button
                            type="button"
                            onClick={handleRate5}
                            className="w-full py-2 px-3 rounded-xl bg-[#005DD6] text-white font-semibold text-xs cursor-pointer"
                          >
                            Оценить на 5 ★ и получить +{order.earnedBonuses} Б
                          </button>
                        )}
                      </div>
                    )}

                    <div
                      className={`text-[10px] text-right ${
                        msg.role === 'client' ? 'text-white/75' : 'text-[#9A9BA1]'
                      }`}
                    >
                      {msg.createdAt} {msg.role === 'client' && '✓✓'}
                    </div>
                  </div>
                </div>
              ))}

              {isMasterTyping && (
                <div className="flex items-center gap-2 text-xs text-[#6e6e73]">
                  <MasterAvatar name={order.master.name} avatar={order.master.avatar} size="sm" showBadge={false} />
                  <div className="bg-white border border-[#E2E4E8] px-3 py-1.5 rounded-full text-xs">
                    Печатает...
                  </div>
                </div>
              )}

              <div ref={chatBottomAnchorRef} className="h-0 w-0" />
            </div>

            {/* Bottom: only the NEXT logical action */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-[#E2E4E8] space-y-2.5">
              {!isMasterTyping && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {flowStep === 'await_photo' && (
                    <button type="button" onClick={handleSendNodePhoto} className={chipPrimary}>
                      📸 Отправить фото места
                    </button>
                  )}
                  {flowStep === 'selecting' && (
                    <>
                      {!analoguesAsked && (
                        <button type="button" onClick={handleAskAnalogues} className={chipPrimary}>
                          💬 Спросить про аналоги и бренды
                        </button>
                      )}
                      <button type="button" onClick={handleSkipMaterials} className={chipSecondary}>
                        Ничего не нужно
                      </button>
                    </>
                  )}
                  {flowStep === 'await_payment' && (
                    <button type="button" onClick={() => setPaymentDialogOpen(true)} className={chipPrimary}>
                      💳 Оплатить {formatBYN(coCartSummary.totalPrice)}
                    </button>
                  )}
                  {flowStep === 'paid' && (
                    <button type="button" onClick={handleSendIntercom} className={chipPrimary}>
                      🏢 Домофон 42, 4 этаж
                    </button>
                  )}
                  {flowStep === 'on_site' && (
                    <button type="button" onClick={() => handleSelectStage('final')} className={chipSuccess}>
                      Перейти к приёмке →
                    </button>
                  )}
                  {flowStep === 'report' && (
                    <button type="button" onClick={handleAcceptWork} className={chipSuccess}>
                      ✍️ Принять работу
                    </button>
                  )}
                  {flowStep === 'accepted' && (
                    <button type="button" onClick={handleRate5} className={chipPrimary}>
                      ⭐ Оценить 5 ★ (+{order.earnedBonuses} Б)
                    </button>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <label
                  className="w-10 h-10 rounded-xl border border-[#E2E4E8] bg-[#F4F4F6] hover:bg-[#EDF4FF] text-[#6e6e73] hover:text-[#005DD6] flex items-center justify-center cursor-pointer shrink-0"
                  title="Прикрепить фото"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const res = ev.target?.result as string;
                          if (res) handleSendMessage('', res);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Сообщение мастеру..."
                  className="flex-1 min-w-0 px-3.5 py-2 text-sm bg-white border border-[#E2E4E8] rounded-xl focus:border-[#005DD6] outline-none"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="h-10 px-4 sm:px-5 rounded-xl bg-[#005DD6] hover:bg-[#004EB8] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0"
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Concise Live Order Summary & Cart Link */}
          <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E2E4E8] space-y-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-[#111111]">Состав заказа</h2>
              <span className="text-[11px] font-medium text-[#005DD6] bg-[#EDF4FF] px-2.5 py-0.5 rounded-full">
                Защищённая оплата ОМА
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {order.productName && (
                <div className="p-3 rounded-2xl bg-[#F4F4F6] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={order.materialPhotos?.[0] || `/master/${order.serviceCategory || 'santekhnika'}.png`}
                      alt=""
                      className="w-10 h-10 rounded-lg object-contain bg-white p-0.5 shrink-0"
                    />
                    <span className="font-medium text-[#111111] truncate">{order.productName}</span>
                  </div>
                  <span className="font-semibold shrink-0">{formatBYN(order.goodsPrice)}</span>
                </div>
              )}

              {addedOrderExtras.map((extra) => (
                <div
                  key={extra.product.id}
                  className="p-3 rounded-2xl bg-[#EDF4FF]/60 border border-[#005DD6]/20 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {extra.product.image ? (
                      <img
                        src={extra.product.image}
                        alt=""
                        className="w-10 h-10 rounded-lg object-contain bg-white p-0.5 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white p-0.5 shrink-0 flex items-center justify-center text-[10px]">
                        ОМА
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-[10px] text-[#005DD6] font-semibold block">
                        В корзине (самовывоз мастером)
                      </span>
                      <span className="font-medium text-[#111111] truncate block">
                        {extra.product.name} × {extra.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-[#005DD6] shrink-0">
                    {formatBYN(extra.product.price * extra.quantity)}
                  </span>
                </div>
              ))}

              <div className="p-3 rounded-2xl bg-[#F4F4F6] flex items-center justify-between">
                <span className="font-medium text-[#111111]">{order.serviceTitle}</span>
                <span className="font-semibold">{formatBYN(order.servicePrice)}</span>
              </div>
            </div>

            <div className="border-t border-[#E2E4E8] pt-4 space-y-2 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-[#111111]">Итого</span>
                <span className="text-xl font-bold text-[#111111]">
                  {formatBYN(order.totalPrice)}
                </span>
              </div>
              <div className="text-xs text-[#2D8B5D] font-medium">
                +{order.earnedBonuses} Б на карту «Баланс»
              </div>
            </div>

            {cartReservedInStore && (
              <button
                type="button"
                onClick={() => openChatScreen('departure')}
                className="w-full h-11 rounded-xl bg-[#005DD6] hover:bg-[#004EB8] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Оплатить материалы в чате</span>
              </button>
            )}

            {reviewSubmitted && (
              <button
                type="button"
                onClick={onOpenLoyalty}
                className="w-full h-11 rounded-xl bg-[#2D8B5D] hover:bg-[#24704b] text-white text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
              >
                Перейти в «Баланс» (+{order.earnedBonuses} Б)
              </button>
            )}
          </div>
        </div>

        {/* Payment for extra materials */}
        <Dialog open={paymentDialogOpen} onOpenChange={(o) => !paymentProcessing && setPaymentDialogOpen(o)} hasCloseButton>
          <Dialog.Header caption="Оплата материалов" />
          <Dialog.Body>
            <div className="space-y-4 w-full sm:w-[400px]">
              <div className="rounded-xl border border-[#E2E4E8] divide-y divide-[#F0F1F3]">
                {coCartSummary.picked.map((p) => (
                  <div key={p.product.id} className="flex items-center justify-between gap-3 p-2.5 text-xs">
                    <span className="truncate">{p.product.name}</span>
                    <span className="font-semibold shrink-0">{formatBYN(p.product.price)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6E6E73]">Карта •••• 4421 · выдача мастеру в ОМА</span>
                <span className="text-lg font-bold">{formatBYN(coCartSummary.totalPrice)}</span>
              </div>
              <button
                type="button"
                disabled={paymentProcessing}
                onClick={handleConfirmPayment}
                className="w-full h-11 rounded-xl bg-[#005DD6] hover:bg-[#004EB8] disabled:opacity-70 text-white text-sm font-semibold cursor-pointer"
              >
                {paymentProcessing ? 'Оплата…' : `Оплатить ${formatBYN(coCartSummary.totalPrice)}`}
              </button>
            </div>
          </Dialog.Body>
        </Dialog>

        {/* Photo Modal */}
        {selectedPhotoModal && (
          <Dialog
            open={Boolean(selectedPhotoModal)}
            onOpenChange={(open) => !open && setSelectedPhotoModal(null)}
            hasCloseButton
          >
            <Dialog.Header caption="Фото" />
            <Dialog.Body>
              <img
                src={selectedPhotoModal}
                alt=""
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
            </Dialog.Body>
          </Dialog>
        )}
      </div>
    );
  }

  // ============================================================================
  // CLEAN, CONCISE ORDER CABINET VIEW
  // ============================================================================
  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6e6e73] mb-1">
            <button
              type="button"
              onClick={onBackToHome}
              className="hover:text-[#005DD6] cursor-pointer"
            >
              ОМА Мастер
            </button>
            <span>/</span>
            <span className="text-[#111111]">Заказ № {order.orderNumber} ({flowSpec.categoryLabel})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111111]">
            Заказ № {order.orderNumber}
          </h1>
        </div>

        {/* Clean 2-Stage Status Indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => openChatScreen('departure')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              order.status === 'on_the_way'
                ? 'bg-[#005DD6] text-white'
                : 'bg-[#2D8B5D]/15 text-[#2D8B5D]'
            }`}
          >
            1. Выезд · {order.dateTime}
          </button>
          <button
            type="button"
            onClick={() => {
              handleSelectStage('final');
              openChatScreen('final');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              order.status !== 'on_the_way'
                ? 'bg-[#2D8B5D] text-white'
                : 'bg-[#F4F4F6] text-[#6e6e73] hover:text-[#111111]'
            }`}
          >
            2. Финал и приёмка
          </button>
        </div>
      </div>

      {/* Main 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Order Composition & Customer Photos */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Composition */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E4E8] space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-[#111111]">Состав заказа</h2>
              <button
                type="button"
                onClick={() => openChatScreen('departure')}
                className="text-xs font-semibold text-[#005DD6] hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Подобрать расходники с мастером</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {order.productName && (
                <div className="p-3.5 bg-[#F4F4F6] rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={order.materialPhotos?.[0] || `/master/${order.serviceCategory || 'santekhnika'}.png`}
                      alt=""
                      className="w-12 h-12 rounded-xl object-contain bg-white border border-[#E2E4E8] p-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-[#6e6e73]">Товар ОМА</p>
                      <p className="text-sm font-semibold text-[#111111] truncate">
                        {order.productName}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#111111] shrink-0">{formatBYN(order.goodsPrice)}</span>
                </div>
              )}

              {addedOrderExtras.map((extra) => (
                <div
                  key={extra.product.id}
                  className="p-3.5 bg-[#EDF4FF]/60 rounded-2xl border border-[#005DD6]/20 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {extra.product.image ? (
                      <img
                        src={extra.product.image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-contain bg-white border border-[#E2E4E8] p-1 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E4E8] p-1 shrink-0 flex items-center justify-center text-xs">
                        ОМА
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-[#005DD6]">
                        Бронь в корзине ОМА (заберёт мастер) · {extra.quantity} шт.
                      </span>
                      <p className="text-sm font-medium text-[#111111] truncate">
                        {extra.product.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#005DD6] shrink-0">
                    {formatBYN(extra.product.price * extra.quantity)}
                  </span>
                </div>
              ))}

              <div className="p-3.5 bg-[#F4F4F6] rounded-2xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#6e6e73] truncate">Услуга · {order.address}</p>
                  <p className="text-sm font-semibold text-[#111111]">{order.serviceTitle}</p>
                </div>
                <span className="text-sm font-bold text-[#111111] shrink-0">
                  {formatBYN(order.servicePrice)}
                </span>
              </div>
            </div>

            <div className="border-t border-[#E2E4E8] pt-4 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-[#005DD6] font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Защищённая оплата ОМА · Гарантия 12 мес.</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#6e6e73] mr-2">Итого:</span>
                <span className="text-xl font-bold text-[#111111]">
                  {formatBYN(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Compact Customer Material Photos */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E4E8] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#111111]">Фото материала и места работ</h3>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDF4FF] text-[#005DD6] text-xs font-semibold cursor-pointer hover:bg-[#005DD6]/15 transition-colors">
                <Camera className="w-3.5 h-3.5" />
                <span>+ Фото</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMaterialPhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {order.materialPhotos && order.materialPhotos.length > 0 ? (
                order.materialPhotos.map((src, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-2xl overflow-hidden border border-[#E2E4E8] bg-[#F4F4F6] aspect-square"
                  >
                    <img
                      src={src}
                      alt=""
                      onClick={() => setSelectedPhotoModal(src)}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setOrder((prev) => ({
                          ...prev,
                          materialPhotos: (prev.materialPhotos || []).filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer"
                    >
                      <TrashBin className="w-3 h-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-5 px-4 bg-[#F8F9FA] rounded-2xl border border-dashed border-[#E2E4E8] text-center">
                  <p className="text-xs text-[#6E6E73]">
                    Фотографии не прикреплены. Вы можете загрузить реальные фото места работ для мастера кнопкой «+ Фото».
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Master Card with Proper Button Spacing */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#E2E4E8] flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <MasterAvatar name={order.master.name} avatar={order.master.avatar} size="lg" />
              <div>
                <p className="text-lg font-bold text-[#111111]">{order.master.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-[#6e6e73] mt-0.5">
                  <StarFill className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-[#111111]">{order.master.rating}</span>
                  <span>·</span>
                  <span>{order.master.completedOrders} заказов</span>
                </div>
                <span className="inline-block mt-1 text-[11px] font-medium text-[#005DD6] bg-[#EDF4FF] px-2 py-0.5 rounded-full">
                  {order.master.park || 'Парк ОМА'}
                </span>
              </div>
            </div>

            {/* Action Buttons Container with Explicit Gap so Buttons Never Stick Together */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => openChatScreen('departure')}
                className="w-full h-12 rounded-2xl bg-[#005DD6] hover:bg-[#004EB8] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Comment className="w-4 h-4" />
                <span>Открыть чат с мастером</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCallModalOpen(true)}
                  className="h-11 px-3 rounded-xl border border-[#E2E4E8] bg-white hover:bg-[#F4F4F6] text-xs font-semibold text-[#111111] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Handset className="w-3.5 h-3.5" />
                  <span>Позвонить</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDateDrawerOpen(true)}
                  className="h-11 px-3 rounded-xl border border-[#E2E4E8] bg-white hover:bg-[#F4F4F6] text-xs font-semibold text-[#111111] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Время</span>
                </button>
              </div>
            </div>
          </div>

          {reviewSubmitted && (
            <div className="bg-[#2D8B5D]/10 border border-[#2D8B5D]/30 rounded-3xl p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CircleCheck className="w-6 h-6 text-[#2D8B5D] shrink-0" />
                <span className="text-xs font-semibold text-[#111111]">
                  Заказ закрыт · +{order.earnedBonuses} Б начислены
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenLoyalty}
                className="text-xs font-bold text-[#005DD6] hover:underline cursor-pointer shrink-0"
              >
                Баланс →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date Change Drawer */}
      <DateTimeDrawer
        open={dateDrawerOpen}
        onClose={() => setDateDrawerOpen(false)}
        serviceTitle={order.serviceTitle}
        servicePrice={order.servicePrice}
        onConfirm={(date, time) => {
          setOrder((prev) => ({ ...prev, dateTime: `${date} · ${time}` }));
          setDateDrawerOpen(false);
        }}
      />

      {/* Call Master Dialog */}
      <Dialog
        open={callModalOpen}
        onOpenChange={(open) => !open && setCallModalOpen(false)}
        hasCloseButton
      >
        <Dialog.Header caption="Звонок мастеру" />
        <Dialog.Body>
          <div className="py-4 space-y-3 text-center">
            <div className="flex justify-center">
              <MasterAvatar name={order.master.name} avatar={order.master.avatar} size="xl" />
            </div>
            <p className="text-base font-bold text-[#111111]">{order.master.name}</p>
            <a
              href={`tel:${order.master.phone}`}
              className="text-xl font-bold text-[#005DD6] hover:underline block"
            >
              {order.master.phone}
            </a>
          </div>
        </Dialog.Body>
      </Dialog>

      {/* Photo Preview Modal */}
      {selectedPhotoModal && (
        <Dialog
          open={Boolean(selectedPhotoModal)}
          onOpenChange={(open) => !open && setSelectedPhotoModal(null)}
          hasCloseButton
        >
          <Dialog.Header caption="Фото" />
          <Dialog.Body>
            <img
              src={selectedPhotoModal}
              alt=""
              className="w-full max-h-[70vh] object-contain rounded-xl"
            />
          </Dialog.Body>
        </Dialog>
      )}
    </div>
  );
};
