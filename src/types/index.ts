export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  subCategory?: string;
  categoryPath?: string;
  brand: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  gallery: string[];
  specs: Record<string, any>;
  inStock: boolean;
  installable: boolean;
  serviceId?: string | null;
  relatedIds?: string[];
  taskTags?: string[];
  url?: string;
}

export type ServiceCategoryId =
  | 'santekhnika'
  | 'elektrika'
  | 'mebel'
  | 'otdelka'
  | 'dveri'
  | 'tekhnika'
  | 'sanuzel'
  | 'prochee';

export interface Service {
  id: string;
  title: string;
  category?: ServiceCategoryId;
  categoryLabel?: string;
  image?: string;
  unit?: string;
  popular?: boolean;
  type: 'fixed' | 'measure';
  price: number;
  duration: string;
  includes: string[];
  excludes: string[];
  warrantyMonths: number;
  bonusRate: number;
}

export interface TaskBundleItem {
  category: string;
  filter: string;
  qty: number;
}

export interface TaskCalculator {
  type: 'none' | 'area';
  defaults?: {
    length: number;
    width: number;
    height: number;
  };
  rates?: {
    paintLitersPerSqM: number;
    primerLitersPerSqM: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  icon: string;
  modes: ('diy' | 'rental' | 'master')[];
  calculator: TaskCalculator;
  bundle: TaskBundleItem[];
  startingPrice?: number;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  installService?: Service | null;
}

export type OrderStatus =
  | 'accepted'
  | 'master_assigned'
  | 'on_the_way'
  | 'done'
  | 'acceptance'
  | 'review';

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

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  bonusBalance: number;
  activityPoints?: number;
  aov?: number;
  activeCoupons?: ActiveCoupon[];
  appliedCoupon?: ActiveCoupon | null;
  cardType: 'balans' | 'vybiraem_sami';
  level: 'novice' | 'master_home' | 'expert';
  city: string;
}
