import React, { useState } from 'react';
import { Button, TabProvider, TabList, Tab, TabPanel, Progress } from '@gravity-ui/uikit';
import {
  ShieldCheck,
  CircleCheck,
  Clock,
  ArrowRight,
  StarFill,
  ArrowRotateLeft,
} from '@gravity-ui/icons';
import { useUser } from '../context/UserContext';
import { formatBYN } from '../config/loyalty';

interface LoyaltyPageProps {
  onGoToCatalog: () => void;
  onOpenMaster: () => void;
}

interface LoyaltyTransaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'accrual' | 'spend';
  status: 'completed' | 'pending';
}

const SAMPLE_TRANSACTIONS: LoyaltyTransaction[] = [
  {
    id: 'tx_1',
    title: 'Отзыв за установку смесителя · Заказ № 84219',
    date: 'Сегодня, 14:32',
    amount: 8,
    type: 'accrual',
    status: 'completed',
  },
  {
    id: 'tx_2',
    title: 'Оплата доставки бонусами · Заказ № 84219',
    date: '28 октября, 12:10',
    amount: -10,
    type: 'spend',
    status: 'completed',
  },
  {
    id: 'tx_3',
    title: 'Покупка товаров в OMA · Чек № 18491',
    date: '24 октября, 18:45',
    amount: 4,
    type: 'accrual',
    status: 'completed',
  },
  {
    id: 'tx_4',
    title: 'Приветственные бонусы за регистрацию в OMA',
    date: '15 октября, 09:00',
    amount: 45,
    type: 'accrual',
    status: 'completed',
  },
];

export const LoyaltyPage: React.FC<LoyaltyPageProps> = ({
  onGoToCatalog,
  onOpenMaster,
}) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  const currentLevelName =
    user.level === 'expert'
      ? 'Эксперт'
      : user.level === 'master_home'
      ? 'Мастер дома'
      : 'Новичок';

  const progressValue = 320;
  const progressTarget = 500;
  const progressPercent = Math.round((progressValue / progressTarget) * 100);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-oma-text-secondary uppercase tracking-wider">
          ПРОГРАММА ЛОЯЛЬНОСТИ OMA
        </p>
        <h1 className="text-3xl lg:text-4xl font-semibold text-oma-text-primary">
          Программа «Баланс»
        </h1>
        <p className="text-base text-oma-text-secondary max-w-2xl">
          Копите бонусы за покупки в гипермаркетах OMA и заказ сертифицированных мастеров. Оплачивайте бонусами до 30% стоимости товаров и услуг.
        </p>
      </div>

      {/* 2. Balance & Level Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main Balance Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#005DD6] to-[#003B8A] text-white rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
          {/* Subtle background circle decoration */}
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute right-12 bottom-4 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium tracking-wider text-white/80 uppercase">
                Ваш баланс
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                1 Б = 1 рубль
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-5xl lg:text-6xl font-bold tracking-tight">
                {user.bonusBalance} <span className="text-3xl font-medium">Б</span>
              </div>
              <p className="text-xs text-white/70">
                Доступно для оплаты заказов и услуг
              </p>
            </div>
          </div>

          <div className="pt-8 space-y-3 relative z-10">
            <div className="flex gap-3">
              <Button
                view="normal"
                size="l"
                onClick={onGoToCatalog}
                className="flex-1 !bg-white !text-oma-blue hover:!bg-gray-100 font-semibold !rounded-xl"
              >
                Потратить
              </Button>
              <Button
                view="outlined"
                size="l"
                onClick={onOpenMaster}
                className="!text-white !border-white/40 hover:!bg-white/10 !rounded-xl"
              >
                Вызвать мастера
              </Button>
            </div>

            <div className="text-[11px] text-white/60 text-center">
              Карта: {user.phone} · {user.name}
            </div>
          </div>
        </div>

        {/* Level & Expiration Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 lg:p-8 border border-oma-border-base flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-oma-text-secondary uppercase">Текущий уровень</span>
                <h3 className="text-2xl font-bold text-oma-text-primary mt-0.5">
                  {currentLevelName}
                </h3>
              </div>
              <span className="px-3 py-1 bg-oma-blue-tint text-oma-blue rounded-full text-xs font-semibold">
                Кэшбэк до 5%
              </span>
            </div>

            {/* Level Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-oma-text-secondary font-medium">
                <span>Прогресс: {progressValue} Б</span>
                <span>Цель: {progressTarget} Б (Эксперт)</span>
              </div>
              <Progress value={progressPercent} size="m" />
              <p className="text-xs text-oma-text-secondary">
                Осталось накопить {progressTarget - progressValue} Б для перехода на уровень «Эксперт» с повышенным кэшбэком 7%.
              </p>
            </div>
          </div>

          {/* Expiration Alert Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-amber-900 block">
                  12 Б скоро сгорят
                </span>
                <span className="text-amber-800">
                  Срок действия части бонусов истекает 15 ноября
                </span>
              </div>
            </div>
            <Button
              view="outlined"
              size="s"
              onClick={onGoToCatalog}
              className="!border-amber-300 !text-amber-900 hover:!bg-amber-100/60"
            >
              Подобрать товар
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Loyalty Tabs: Overview, History, Rules */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-oma-border-base space-y-6">
        <TabProvider value={activeTab} onUpdate={setActiveTab}>
          <TabList size="l">
            <Tab value="overview">Обзор</Tab>
            <Tab value="history">История операций</Tab>
            <Tab value="rules">Как копить и тратить</Tab>
          </TabList>

          {/* TAB 1: OVERVIEW */}
          <TabPanel value="overview">
            <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-oma-bg-card border border-oma-border-base space-y-2">
                <div className="text-2xl font-bold text-oma-blue">5%</div>
                <h4 className="text-sm font-semibold text-oma-text-primary">Кэшбэк за товары</h4>
                <p className="text-xs text-oma-text-secondary leading-relaxed">
                  Начисляется за покупку любых товаров собственных торговых марок и товаров с отметкой «Баланс».
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-oma-bg-card border border-oma-border-base space-y-2">
                <div className="text-2xl font-bold text-oma-blue">+8 Б</div>
                <h4 className="text-sm font-semibold text-oma-text-primary">Бонусы за мастера</h4>
                <p className="text-xs text-oma-text-secondary leading-relaxed">
                  Начисляются после успешной приёмки работ и оставленного отзыва о работе специалиста.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-oma-bg-card border border-oma-border-base space-y-2">
                <div className="text-2xl font-bold text-oma-blue">до 30%</div>
                <h4 className="text-sm font-semibold text-oma-text-primary">Оплата бонусами</h4>
                <p className="text-xs text-oma-text-secondary leading-relaxed">
                  Списывайте бонусы прямо в корзине или при оформлении вызова мастера: 1 бонус = 1 рубль скидки.
                </p>
              </div>
            </div>
          </TabPanel>

          {/* TAB 2: HISTORY */}
          <TabPanel value="history">
            <div className="pt-6 divide-y divide-oma-border-base">
              {SAMPLE_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-oma-text-primary">{tx.title}</p>
                    <p className="text-xs text-oma-text-secondary">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-base font-bold ${
                        tx.amount > 0 ? 'text-oma-green' : 'text-oma-text-primary'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount} Б` : `${tx.amount} Б`}
                    </span>
                    <span className="block text-[11px] text-oma-text-secondary">
                      Выполнено
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabPanel>

          {/* TAB 3: RULES */}
          <TabPanel value="rules">
            <div className="pt-6 space-y-4 text-sm text-oma-text-secondary leading-relaxed">
              <div className="p-4 bg-oma-bg-card rounded-2xl border border-oma-border-base space-y-2">
                <h4 className="text-base font-semibold text-oma-text-primary">
                  1. Правила начисления
                </h4>
                <p>
                  Бонусы начисляются в течение 24 часов после получения заказа в магазине или после подписания электронного акта приёмки работ мастера OMA.
                </p>
              </div>

              <div className="p-4 bg-oma-bg-card rounded-2xl border border-oma-border-base space-y-2">
                <h4 className="text-base font-semibold text-oma-text-primary">
                  2. Правила списания
                </h4>
                <p>
                  Бонусами можно оплатить до 30% стоимости любого чека. Бонусы не суммируются с отдельными акционными скидками и не применяются к подарочным сертификатам.
                </p>
              </div>

              <div className="p-4 bg-oma-bg-card rounded-2xl border border-oma-border-base space-y-2">
                <h4 className="text-base font-semibold text-oma-text-primary">
                  3. Срок жизни бонусов
                </h4>
                <p>
                  Бонусы активны 180 календарных дней с момента начисления. За 14 дней до сгорания вы получите уведомление в личном кабинете.
                </p>
              </div>
            </div>
          </TabPanel>
        </TabProvider>
      </div>

      {/* 4. Barcode for Offline Cashier Scanning */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-oma-border-base flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-semibold text-oma-text-primary">
            Электронная карта для кассы
          </h3>
          <p className="text-xs text-oma-text-secondary">
            Покажите штрихкод кассиру в любом магазине OMA для начисления и списания бонусов
          </p>
        </div>

        {/* Barcode Mock Visual */}
        <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-oma-border-base shadow-sm">
          <div className="flex items-center gap-[3px] h-14 px-4 bg-gray-100 rounded-lg">
            {[4, 2, 6, 2, 3, 5, 2, 4, 3, 6, 2, 5, 4, 2, 3, 5, 2, 4, 6, 2, 4].map((w, idx) => (
              <div
                key={idx}
                className="bg-black h-10"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
          <span className="text-xs font-mono tracking-widest text-oma-text-primary mt-2">
            2900 1842 9104
          </span>
        </div>
      </div>
    </div>
  );
};
