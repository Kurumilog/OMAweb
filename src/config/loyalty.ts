// Rules and parameters for OMA Dom loyalty program
export const BONUS_RATE_GOODS = 0.05; // 5% for goods
export const BONUS_RATE_SERVICE = 0.03; // 3% for master service
export const MAX_BONUS_PAY_SHARE = 0.30; // up to 30% can be paid by points
export const BONUS_TTL_DAYS = 90; // points active for 90 days
export const RENTAL_DISCOUNT = 0.20; // 20% discount on tool rental with Balans card

export const WELCOME_BONUSES_REGISTRATION = 5;
export const WELCOME_BONUSES_INTERESTS = 10;

export interface LoyaltyLevel {
  id: 'novice' | 'master_home' | 'expert';
  title: string;
  minSpend: number;
  perk: string;
}

export const LEVELS: LoyaltyLevel[] = [
  {
    id: 'novice',
    title: 'Новичок',
    minSpend: 0,
    perk: '5% бонусами за покупки и 3% за вызов мастера'
  },
  {
    id: 'master_home',
    title: 'Мастер дома',
    minSpend: 500,
    perk: '6% бонусами + бесплатная консультация мастера раз в сезон'
  },
  {
    id: 'expert',
    title: 'Эксперт',
    minSpend: 1500,
    perk: '7% бонусами + приоритетное назначение мастеров за 2 часа'
  }
];

export function formatBYN(amount: number): string {
  return new Intl.NumberFormat('ru-BY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace(',', '.') + ' руб.';
}

export function formatPoints(points: number): string {
  return `${Math.round(points)} Б`;
}
