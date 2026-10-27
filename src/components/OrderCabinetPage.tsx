import React, { useState } from 'react';
import { Button, Dialog, TextArea } from '@gravity-ui/uikit';
import {
  ArrowLeft,
  CircleCheck,
  Clock,
  GeoPin,
  ShieldCheck,
  FileText,
  Handset,
  Comment,
  StarFill,
  Check,
} from '@gravity-ui/icons';
import { OrderStatus } from '../types';
import { useUser } from '../context/UserContext';
import { formatBYN } from '../config/loyalty';
import { DateTimeDrawer } from './DateTimeDrawer';

export interface CabinetOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  serviceTitle: string;
  productName?: string;
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
    avatar: string;
    rating: number;
    completedOrders: number;
    phone: string;
  };
}

interface OrderCabinetPageProps {
  order?: CabinetOrder;
  onBackToHome: () => void;
  onGoToCatalog: () => void;
  onOpenLoyalty: () => void;
}

const DEFAULT_ORDER: CabinetOrder = {
  id: 'ord_84219',
  orderNumber: '84219',
  status: 'on_the_way',
  serviceTitle: 'Установка смесителя',
  productName: 'Смеситель для ванны Wisent (Хром) WP22153',
  address: 'г. Минск, ул. Притыцкого, д. 10, кв. 24',
  dateTime: '29 октября · 13–18',
  goodsPrice: 105.79,
  servicePrice: 25.0,
  deliveryPrice: 8.0,
  discountBonus: 10.0,
  totalPrice: 128.79,
  earnedBonuses: 8,
  master: {
    name: 'Алексей С.',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    completedOrders: 248,
    phone: '+375 (29) 765-43-21',
  },
};

const ORDER_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'accepted', label: 'Заказ принят' },
  { key: 'master_assigned', label: 'Мастер назначен' },
  { key: 'on_the_way', label: 'В пути' },
  { key: 'done', label: 'Работа выполнена' },
  { key: 'acceptance', label: 'Приёмка' },
  { key: 'review', label: 'Отзыв' },
];

export const OrderCabinetPage: React.FC<OrderCabinetPageProps> = ({
  order: initialOrder,
  onBackToHome,
  onGoToCatalog,
  onOpenLoyalty,
}) => {
  const { addBonuses } = useUser();
  const [order, setOrder] = useState<CabinetOrder>(initialOrder || DEFAULT_ORDER);

  // Modals & drawers
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([
    'Здравствуйте! Я мастер по вашей заявке. Буду у вас около 14:00, инструмент с собой.',
  ]);
  const [newMsg, setNewMsg] = useState('');

  // Acceptance Checklist
  const [chkLeak, setChkLeak] = useState(false);
  const [chkClean, setChkClean] = useState(false);
  const [chkWarranty, setChkWarranty] = useState(false);

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === order.status);

  // Advance Order Lifecycle
  const advanceToStatus = (newStatus: OrderStatus) => {
    setOrder((prev) => ({ ...prev, status: newStatus }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAcceptanceSubmit = () => {
    advanceToStatus('review');
  };

  const handleReviewSubmit = () => {
    setReviewSubmitted(true);
    addBonuses(order.earnedBonuses);
  };

  const handleSendMessage = () => {
    if (!newMsg.trim()) return;
    setChatMessages((prev) => [...prev, newMsg.trim()]);
    setNewMsg('');
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        'Спасибо за информацию, принял во внимание!',
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-oma-text-secondary">
            <button
              type="button"
              onClick={onBackToHome}
              className="hover:text-oma-blue transition-colors cursor-pointer"
            >
              Главная
            </button>
            <span>/</span>
            <span>Кабинет заказа</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-oma-text-primary">
            Заказ № {order.orderNumber}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-oma-blue-tint text-oma-blue border border-oma-blue/30">
            {order.status === 'on_the_way'
              ? 'Мастер в пути · 13–18'
              : order.status === 'done'
              ? 'Работы завершены · Ожидает приёмки'
              : order.status === 'acceptance'
              ? 'Приёмка работ'
              : order.status === 'review'
              ? reviewSubmitted
                ? 'Заказ закрыт · Бонусы начислены'
                : 'Оставьте отзыв'
              : 'В обработке'}
          </span>
        </div>
      </div>

      {/* 2. 6-Step Order Status Bar */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-oma-border-base space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold text-oma-text-primary">Статус выполнения</h2>
          <span className="text-xs text-oma-text-secondary">
            Шаг {currentStepIndex + 1} из {ORDER_STEPS.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
          {ORDER_STEPS.map((s, idx) => {
            const isCompleted = idx < currentStepIndex || (idx === currentStepIndex && reviewSubmitted);
            const isCurrent = idx === currentStepIndex && !reviewSubmitted;

            return (
              <div
                key={s.key}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-oma-blue-tint border-oma-blue text-oma-blue font-semibold ring-1 ring-oma-blue'
                    : isCompleted
                    ? 'bg-oma-green/10 border-oma-green/30 text-oma-green'
                    : 'bg-oma-bg-card border-oma-border-base text-oma-text-secondary opacity-60'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {isCompleted ? (
                    <CircleCheck className="w-4 h-4 text-oma-green" />
                  ) : (
                    <span
                      className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        isCurrent
                          ? 'bg-oma-blue text-white'
                          : 'bg-oma-border-base text-oma-text-secondary'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  )}
                </div>
                <div className="text-xs truncate">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Status Simulator Controls (to test interactive flow) */}
        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-oma-border-base">
          <span className="text-xs text-oma-text-secondary">Переключить состояние мастера:</span>
          {order.status === 'on_the_way' && (
            <Button
              view="action"
              size="s"
              onClick={() => advanceToStatus('done')}
              className="!bg-[#005DD6] !text-white text-xs"
            >
              Мастер завершил работу →
            </Button>
          )}
          {order.status === 'done' && (
            <Button
              view="action"
              size="s"
              onClick={() => advanceToStatus('acceptance')}
              className="!bg-[#005DD6] !text-white text-xs"
            >
              Перейти к приёмке →
            </Button>
          )}
          {order.status === 'acceptance' && (
            <Button
              view="action"
              size="s"
              onClick={() => advanceToStatus('review')}
              className="!bg-[#005DD6] !text-white text-xs"
            >
              Принять работу →
            </Button>
          )}
          {order.status === 'review' && (
            <Button
              view="outlined"
              size="s"
              onClick={() => advanceToStatus('on_the_way')}
              className="text-xs"
            >
              Вернуть в «В пути»
            </Button>
          )}
        </div>
      </div>

      {/* 3. Acceptance / Review Interactive Section (when active) */}
      {order.status === 'acceptance' && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border-2 border-oma-blue space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-oma-blue text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-2xl font-medium text-oma-text-primary">
                Приёмка выполненных работ
              </h2>
              <p className="text-sm text-oma-text-secondary">
                Проверьте работу вместе с мастером перед подписанием электронного акта
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-oma-bg-card p-5 rounded-2xl border border-oma-border-base">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={chkLeak}
                onChange={(e) => setChkLeak(e.target.checked)}
                className="w-5 h-5 rounded text-oma-blue cursor-pointer"
              />
              <span className="text-sm text-oma-text-primary">
                Смеситель надёжно закреплён, соединения герметичны, протечек нет
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={chkClean}
                onChange={(e) => setChkClean(e.target.checked)}
                className="w-5 h-5 rounded text-oma-blue cursor-pointer"
              />
              <span className="text-sm text-oma-text-primary">
                Рабочее место убрано, строительный мусор собран
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={chkWarranty}
                onChange={(e) => setChkWarranty(e.target.checked)}
                className="w-5 h-5 rounded text-oma-blue cursor-pointer"
              />
              <span className="text-sm text-oma-text-primary">
                Мастер проверил напор воды и передал гарантийный талон
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              view="action"
              size="xl"
              disabled={!(chkLeak && chkClean && chkWarranty)}
              onClick={handleAcceptanceSubmit}
              className="!bg-[#005DD6] !text-white !rounded-xl !h-[52px] px-8 text-base font-medium hover:!bg-[#004EB8] transition-colors"
            >
              Подписать акт и принять работу
            </Button>
          </div>
        </div>
      )}

      {order.status === 'review' && !reviewSubmitted && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border-2 border-oma-green space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-oma-green text-white flex items-center justify-center font-bold">
              ★
            </div>
            <div>
              <h2 className="text-2xl font-medium text-oma-text-primary">
                Оцените работу мастера
              </h2>
              <p className="text-sm text-oma-text-secondary">
                После отзыва вам автоматически начислится +{order.earnedBonuses} Б в программе «Баланс»
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-oma-text-secondary block mb-1">
                Ваша оценка мастеру:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <StarFill
                      className={`w-7 h-7 ${
                        star <= reviewRating ? 'text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-base font-bold ml-2 text-oma-text-primary">
                  {reviewRating} из 5
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-oma-text-secondary">
                Комментарий к отзыву:
              </label>
              <TextArea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Что понравилось? Быстро ли выполнена работа?"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              view="action"
              size="xl"
              onClick={handleReviewSubmit}
              className="!bg-[#2D8B5D] !text-white !rounded-xl !h-[52px] px-8 text-base font-medium hover:!bg-[#24704b] transition-colors"
            >
              Отправить отзыв и получить +{order.earnedBonuses} Б
            </Button>
          </div>
        </div>
      )}

      {reviewSubmitted && (
        <div className="bg-oma-green/10 border border-oma-green/30 rounded-3xl p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CircleCheck className="w-8 h-8 text-oma-green shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-oma-text-primary">
                Спасибо за отзыв!
              </h3>
              <p className="text-sm text-oma-text-secondary">
                Вам начислено +{order.earnedBonuses} бонусов «Баланс». Заказ успешно завершён.
              </p>
            </div>
          </div>
          <Button
            view="action"
            size="l"
            onClick={onOpenLoyalty}
            className="!bg-[#005DD6] !text-white"
          >
            Посмотреть баланс
          </Button>
        </div>
      )}

      {/* 4. Two Columns: Left Details (8 cols) & Right Master & Controls (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Details Panel */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-oma-border-base space-y-6">
            <h3 className="text-xl font-semibold text-oma-text-primary">Состав заказа</h3>

            {/* Goods line */}
            {order.productName && (
              <div className="p-4 bg-oma-bg-card rounded-2xl flex items-center justify-between border border-oma-border-base">
                <div>
                  <p className="text-xs text-oma-text-secondary">Товар из каталога OMA</p>
                  <p className="text-sm font-medium text-oma-text-primary">{order.productName}</p>
                </div>
                <span className="text-sm font-semibold">{formatBYN(order.goodsPrice)}</span>
              </div>
            )}

            {/* Service line */}
            <div className="p-4 bg-oma-bg-card rounded-2xl flex items-center justify-between border border-oma-border-base">
              <div>
                <p className="text-xs text-oma-text-secondary">Услуга мастера</p>
                <p className="text-sm font-medium text-oma-text-primary">{order.serviceTitle}</p>
              </div>
              <span className="text-sm font-semibold">{formatBYN(order.servicePrice)}</span>
            </div>

            {/* Address & Date info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-oma-text-secondary">
              <div className="p-3 bg-oma-bg-page rounded-xl">
                <span className="font-medium text-oma-text-primary block mb-0.5">Адрес:</span>
                {order.address}
              </div>
              <div className="p-3 bg-oma-bg-page rounded-xl">
                <span className="font-medium text-oma-text-primary block mb-0.5">Дата и время:</span>
                {order.dateTime}
              </div>
            </div>

            {/* Breakdown */}
            <div className="border-t border-oma-border-base pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-oma-text-secondary">
                <span>Товары</span>
                <span className="text-oma-text-primary font-medium">
                  {formatBYN(order.goodsPrice)}
                </span>
              </div>
              <div className="flex justify-between text-oma-text-secondary">
                <span>Услуги</span>
                <span className="text-oma-text-primary font-medium">
                  {formatBYN(order.servicePrice)}
                </span>
              </div>
              <div className="flex justify-between text-oma-text-secondary">
                <span>Доставка</span>
                <span className="text-oma-text-primary font-medium">
                  {formatBYN(order.deliveryPrice)}
                </span>
              </div>
              {order.discountBonus > 0 && (
                <div className="flex justify-between text-oma-green font-medium">
                  <span>Списано бонусов</span>
                  <span>−{formatBYN(order.discountBonus)}</span>
                </div>
              )}
              <div className="border-t border-oma-border-base pt-2 flex justify-between items-baseline">
                <span className="text-base font-semibold text-oma-text-primary">Итого</span>
                <span className="text-2xl font-bold text-oma-text-primary">
                  {formatBYN(order.totalPrice)}
                </span>
              </div>
              <div className="text-xs text-oma-blue font-medium text-right">
                +{order.earnedBonuses} Б после закрытия заказа
              </div>
            </div>

            {/* Documents */}
            <div className="border-t border-oma-border-base pt-4 flex flex-wrap gap-4 text-xs">
              <button
                type="button"
                className="flex items-center gap-2 text-oma-blue hover:underline cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Гарантия · 12 месяцев</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2 text-oma-blue hover:underline cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Чек заказа</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Master Card & Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Master Card */}
          <div className="bg-white rounded-3xl p-6 border border-oma-border-base space-y-5">
            <h3 className="text-base font-semibold text-oma-text-primary">Назначенный мастер</h3>

            <div className="flex items-center gap-4">
              <img
                src={order.master.avatar}
                alt={order.master.name}
                className="w-16 h-16 rounded-2xl object-cover border border-oma-border-base"
              />
              <div>
                <p className="text-lg font-semibold text-oma-text-primary">{order.master.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-oma-text-secondary mt-0.5">
                  <StarFill className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-oma-text-primary">{order.master.rating}</span>
                  <span>·</span>
                  <span>{order.master.completedOrders} заказов</span>
                </div>
                <span className="inline-block mt-1 text-[11px] font-medium text-oma-blue bg-oma-blue-tint px-2 py-0.5 rounded-full">
                  Проверен OMA
                </span>
              </div>
            </div>

            {/* Communication Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                view="outlined"
                size="l"
                onClick={() => setCallModalOpen(true)}
                className="!rounded-xl flex items-center justify-center gap-2"
              >
                <Handset className="w-4 h-4" />
                <span>Позвонить</span>
              </Button>
              <Button
                view="action"
                size="l"
                onClick={() => setChatModalOpen(true)}
                className="!bg-[#005DD6] !text-white !rounded-xl flex items-center justify-center gap-2"
              >
                <Comment className="w-4 h-4" />
                <span>Чат</span>
              </Button>
            </div>

            {/* Order Controls */}
            <div className="border-t border-oma-border-base pt-4 space-y-2 text-xs">
              <button
                type="button"
                onClick={() => setDateDrawerOpen(true)}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-oma-bg-card text-oma-text-primary font-medium flex items-center justify-between cursor-pointer"
              >
                <span>Перенести время</span>
                <Clock className="w-4 h-4 text-oma-text-secondary" />
              </button>
              <button
                type="button"
                onClick={() => alert('Для отмены заказа свяжитесь со службой поддержки по номеру 7770')}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-red-50 text-red-600 font-medium flex items-center justify-between cursor-pointer"
              >
                <span>Отменить заказ</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Правила сервиса: гарантия 12 месяцев, бесплатная отмена за 24 часа.')}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-oma-bg-card text-oma-text-secondary flex items-center justify-between cursor-pointer"
              >
                <span>Правила и поддержка</span>
              </button>
            </div>
          </div>

          {/* Next Task Card */}
          <div className="bg-white rounded-3xl p-6 border border-oma-border-base space-y-3">
            <h4 className="text-sm font-semibold text-oma-text-primary">Следующая задача?</h4>
            <p className="text-xs text-oma-text-secondary">
              Запланируйте установку техники, дверей или сборку мебели со скидкой
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                view="outlined"
                size="m"
                onClick={onGoToCatalog}
                className="flex-1 !rounded-xl"
              >
                В каталог
              </Button>
            </div>
          </div>
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
        onOpenChange={(isOpen) => {
          if (!isOpen) setCallModalOpen(false);
        }}
        hasCloseButton
      >
        <Dialog.Header caption="Звонок мастеру" />
        <Dialog.Body>
          <div className="py-4 space-y-3 text-center">
            <p className="text-sm text-oma-text-secondary">Мастер {order.master.name}</p>
            <a
              href={`tel:${order.master.phone}`}
              className="text-2xl font-bold text-oma-blue hover:underline inline-block"
            >
              {order.master.phone}
            </a>
            <p className="text-xs text-oma-text-secondary">
              Бесплатно по всей Беларуси с мобильных операторов
            </p>
          </div>
        </Dialog.Body>
        <Dialog.Footer
          textButtonCancel="Закрыть"
          onClickButtonCancel={() => setCallModalOpen(false)}
        />
      </Dialog>

      {/* Chat Master Dialog */}
      <Dialog
        open={chatModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setChatModalOpen(false);
        }}
        hasCloseButton
      >
        <Dialog.Header caption={`Чат с мастером (${order.master.name})`} />
        <Dialog.Body>
          <div className="py-2 space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-oma-bg-card rounded-2xl border border-oma-border-base">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs ${
                    i % 2 === 0
                      ? 'bg-white text-oma-text-primary mr-8'
                      : 'bg-oma-blue text-white ml-8'
                  }`}
                >
                  {msg}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Напишите сообщение мастеру..."
                className="flex-1 px-4 py-2 text-sm border border-oma-border-base rounded-xl focus:border-oma-blue outline-none"
              />
              <Button
                view="action"
                size="l"
                onClick={handleSendMessage}
                className="!bg-[#005DD6] !text-white"
              >
                Отправить
              </Button>
            </div>
          </div>
        </Dialog.Body>
      </Dialog>
    </div>
  );
};
