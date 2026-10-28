// Rules and parameters for OMA Loyalty 2.0 (Модель 3 / 6 / 10 баллов)
export const BONUS_RATE_GOODS = 0.04; // 4% базовый кэшбэк на все товары
export const BONUS_RATE_SERVICE = 0.03; // 3% кэшбэк за вызов и услуги мастера
export const MAX_BONUS_PAY_SHARE = 0.20; // до 20% чека можно оплатить бонусами
export const BONUS_TTL_DAYS = 180; // бонусы активны 180 дней (6 месяцев)
export const ACTIVITY_POINT_TTL_DAYS = 180; // баллы активности активны 6 месяцев
export const COUPON_TTL_DAYS = 30; // срок действия активированного купона 30 дней

export const WELCOME_BONUSES_REGISTRATION = 5;
export const WELCOME_BONUSES_INTERESTS = 10;

// Monthly Task definition for Activity Points
export interface MonthlyTask {
  id: string;
  number: number;
  title: string;
  category: string;
  conditionBasic: string;
  conditionDynamic: string;
  businessGoal: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  completed: boolean;
  pointsReward: number; // usually 1
  actionLabel: string;
  actionView?: string;
  icon: 'shopping' | 'wrench' | 'mobile' | 'box';
}

// Reward Option inside a Tier
export interface RewardOption {
  id: string;
  title: string;
  badge: string;
  discountDisplay: string;
  scope: string;
  minSpend?: number;
  maxDiscountCap: number; // BYN limit
  economicsNote: string;
  couponCode: string;
  description: string;
}

// Reward Tier (3 / 6 / 10)
export interface RewardTier {
  level: 1 | 2 | 3;
  requiredPoints: 3 | 6 | 10;
  name: string;
  tagline: string;
  choicesCount: 1; // client chooses 1 coupon
  options: RewardOption[];
}

export interface ActiveCoupon {
  id: string;
  code: string;
  title: string;
  discount: string;
  expiresInDays: number;
  minSpend?: number;
  maxDiscountCap: number;
  activatedAt: string;
}

export const REWARD_TIERS: RewardTier[] = [
  {
    level: 1,
    requiredPoints: 3,
    name: 'Быстрый старт',
    tagline: 'Прокат профессионального инструмента ОМА',
    choicesCount: 1,
    options: [
      {
        id: 'tier1_tool_rental',
        title: 'Скидка 30% на сутки проката инструмента',
        badge: 'Скидка 30%',
        discountDisplay: '30%',
        scope: 'Прокат инструмента в ОМА (Bosch, Makita, Metabo)',
        maxDiscountCap: 15,
        economicsNote: 'Нулевая себестоимость (инструмент на балансе ОМА), экономия 10–15 руб.',
        couponCode: 'RENT-30-START',
        description: 'Скидка 30% на одни сутки аренды любого инструмента из парка ОМА. Потолок выгоды — 15 руб.',
      },
    ],
  },
  {
    level: 2,
    requiredPoints: 6,
    name: 'Ускорение ремонта',
    tagline: 'Выберите 1 купон: логистика или ремонтные категории',
    choicesCount: 1,
    options: [
      {
        id: 'tier2_logistics',
        title: 'Скидка 30% на платную доставку или подъём',
        badge: 'Логистика · 30%',
        discountDisplay: '30%',
        scope: 'Тяжёлая/загородная доставка (>30 кг) или подъём на этаж',
        minSpend: 100,
        maxDiscountCap: 20,
        economicsNote: 'Компенсация платной боли клиента при чеке от 100 руб.',
        couponCode: 'LOGIST-30-OMA',
        description: 'Скидка 30% на крупногабаритную доставку, загородный рейс или подъём на этаж при заказе от 100 руб.',
      },
      {
        id: 'tier2_repair_category',
        title: 'Скидка 5% на товары для монтажа и ремонта',
        badge: 'Ремонт · 5%',
        discountDisplay: '5%',
        scope: 'Сантехника, Электрика, Инструмент, ЛКМ',
        minSpend: 60,
        maxDiscountCap: 20,
        economicsNote: 'Скидка на среднемаржинальные категории при чеке от 60 руб.',
        couponCode: 'REPAIR-5-MID',
        description: 'Скидка 5% на категории: сантехника, электрика, ручной и электроинструмент, краски и лаки от 60 руб.',
      },
    ],
  },
  {
    level: 3,
    requiredPoints: 10,
    name: 'Максимум выгоды',
    tagline: 'Выберите 1 купон: финишная отделка, распродажа или ОМА Мастер',
    choicesCount: 1,
    options: [
      {
        id: 'tier3_high_margin',
        title: 'Скидка 8% на Декор, Освещение и Сад',
        badge: 'Уют и Сад · 8%',
        discountDisplay: '8%',
        scope: 'Декор, Освещение, Текстиль, Товары для сада',
        minSpend: 50,
        maxDiscountCap: 35,
        economicsNote: 'Высокомаржинальная категория со скидкой 8% при чеке от 50 руб.',
        couponCode: 'DECOR-8-MAX',
        description: 'Скидка 8% на люстры, бра, текстиль, декор стен и садово-парковую мебель при чеке от 50 руб.',
      },
      {
        id: 'tier3_seasonal_stock',
        title: 'Скидка 10% на сезонную распродажу',
        badge: 'Распродажа · 10%',
        discountDisplay: '10%',
        scope: 'Товары из раздела сезонного стока ОМА',
        minSpend: 50,
        maxDiscountCap: 40,
        economicsNote: 'Ускорение оборачиваемости сезонного ассортимента',
        couponCode: 'SEASON-10-OUTLET',
        description: 'Дополнительная скидка 10% на акционный и сезонный ассортимент гипермаркетов ОМА от 50 руб.',
      },
      {
        id: 'tier3_master_service',
        title: 'Купон 10% на услуги сервиса «ОМА Мастер»',
        badge: 'Мастер · 10%',
        discountDisplay: '10%',
        scope: 'Любые монтажные и сантехнические работы ОМА Мастер',
        minSpend: 60,
        maxDiscountCap: 40,
        economicsNote: 'Стимулирование заказа монтажа и приёмки работ',
        couponCode: 'MASTER-10-PRO',
        description: 'Скидка 10% на монтаж сантехники, укладку ламината, сборку мебели и электрику при заказе от 60 руб.',
      },
    ],
  },
];

// 4 Monthly Quests for Activity Points
export const INITIAL_MONTHLY_TASKS: MonthlyTask[] = [
  {
    id: 'task_basic_visit',
    number: 1,
    title: 'Базовый визит',
    category: 'Регулярные покупки',
    conditionBasic: 'Покупка от 35 руб.',
    conditionDynamic: 'Max(35 руб., 0.8 × AOV) = 36 руб.',
    businessGoal: 'Поддержка базовой частоты визитов в ОМА',
    currentValue: 75.6,
    targetValue: 35,
    unit: 'руб.',
    completed: true,
    pointsReward: 1,
    actionLabel: 'Выполнено',
    actionView: 'cart',
    icon: 'shopping',
  },
  {
    id: 'task_target_category',
    number: 2,
    title: 'Целевая категория или Установка',
    category: 'Кросс-продажи и сервис',
    conditionBasic: 'Покупка от 35 руб. в персональной категории',
    conditionDynamic: 'Смежная категория по этапу ремонта или товар с установкой',
    businessGoal: 'Увеличение частоты и конверсии в сервис «ОМА Мастер»',
    currentValue: 60,
    targetValue: 35,
    unit: 'руб.',
    completed: true,
    pointsReward: 1,
    actionLabel: 'Выполнено',
    actionView: 'master',
    icon: 'wrench',
  },
  {
    id: 'task_digital_channel',
    number: 3,
    title: 'Цифровой канал / Марки ОМА',
    category: 'Онлайн и СТМ',
    conditionBasic: 'Самовывоз Click&Collect от 45 руб. или товары СТМ от 30 руб.',
    conditionDynamic: 'Перевод в онлайн и рост доли СТМ с высокой маржой 45%+',
    businessGoal: 'Развитие омниканальности и собственных брендов',
    currentValue: 30,
    targetValue: 45,
    unit: 'руб.',
    completed: false,
    pointsReward: 1,
    actionLabel: 'В каталог товаров',
    actionView: 'catalog',
    icon: 'mobile',
  },
  {
    id: 'task_large_purchase',
    number: 4,
    title: 'Крупная закупка для ремонта',
    category: 'Объём корзины',
    conditionBasic: 'Единоразовая покупка от 110 руб.',
    conditionDynamic: 'Max(110 руб., 1.35 × AOV) = 110 руб.',
    businessGoal: 'Рост чека под ключевые этапы ремонта (плитка, ламинат, смеси)',
    currentValue: 148.3,
    targetValue: 110,
    unit: 'руб.',
    completed: true,
    pointsReward: 1,
    actionLabel: 'Выполнено',
    actionView: 'catalog',
    icon: 'box',
  },
];

export function formatBYN(amount: number): string {
  return new Intl.NumberFormat('ru-BY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace(',', '.') + ' руб.';
}

export function formatPoints(points: number): string {
  return `${Math.round(points)} руб.`;
}

export function formatActivityPoints(points: number): string {
  const mod10 = points % 10;
  const mod100 = points % 100;
  if (mod100 >= 11 && mod100 <= 19) return `${points} баллов`;
  if (mod10 === 1) return `${points} балл`;
  if (mod10 >= 2 && mod10 <= 4) return `${points} балла`;
  return `${points} баллов`;
}

export function calculateBonusPoints(amount: number): number {
  return Math.max(1, Math.round(amount * BONUS_RATE_GOODS));
}

export function calculateCashback(amount: number): number {
  return Number((amount * BONUS_RATE_GOODS).toFixed(2));
}
