import { CartItem, Service } from '../types/index';
import servicesData from '../data/services.json';
import { BONUS_RATE_GOODS, BONUS_RATE_SERVICE } from '../config/loyalty';

const allServices = servicesData as Service[];

export interface ServiceCheckGroup {
  checkNumber: number;
  service: Service;
  items: CartItem[];
  isServiceActive: boolean;
  goodsTotal: number;
  serviceTotal: number;
  total: number;
  bonusesEarned: number;
}

export interface CartChecksBreakdown {
  /** Distinct checks per installation service (each service = separate check) */
  serviceChecks: ServiceCheckGroup[];
  /** Non-installable standalone items that do not belong to any service check */
  standaloneGoodsItems: CartItem[];
  standaloneGoodsTotal: number;
  /** True when the user has 2+ different services (or a service + unrelated standalone goods) */
  hasMultipleChecks: boolean;
}

/**
 * Resolves the appropriate installation Service for any product (never falling back to faucet for non-faucets).
 */
export function resolveServiceForProduct(product: {
  serviceId?: string | null;
  category?: string | null;
  name?: string | null;
}): Service | null {
  if (product.serviceId) {
    const exact = allServices.find((s) => s.id === product.serviceId);
    if (exact) return exact;
  }
  const nameLower = (product.name || '').toLowerCase();
  if (nameLower.includes('унитаз') || nameLower.includes('инсталляц')) {
    return allServices.find((s) => s.id === 'svc_toilet_install') || null;
  }
  if (nameLower.includes('ванн') || nameLower.includes('душев')) {
    return allServices.find((s) => s.id === 'svc_bath_install') || null;
  }
  if (nameLower.includes('раковин') || nameLower.includes('мойк') || nameLower.includes('умывальн')) {
    return allServices.find((s) => s.id === 'svc_sink_install') || null;
  }
  if (nameLower.includes('смесител')) {
    return allServices.find((s) => s.id === 'svc_faucet_install') || null;
  }
  if (nameLower.includes('люстр') || nameLower.includes('светильн') || nameLower.includes('бра')) {
    return allServices.find((s) => s.id === 'svc_lighting_install') || null;
  }
  if (nameLower.includes('розетк') || nameLower.includes('выключател')) {
    return allServices.find((s) => s.id === 'svc_socket_install') || null;
  }
  if (nameLower.includes('ламинат') || nameLower.includes('паркет') || nameLower.includes('линолеум')) {
    return allServices.find((s) => s.id === 'svc_laminate_install') || null;
  }
  if (nameLower.includes('краск') || nameLower.includes('эмаль') || nameLower.includes('грунтовк')) {
    return allServices.find((s) => s.id === 'svc_wall_painting') || null;
  }
  if (nameLower.includes('двер')) {
    return allServices.find((s) => s.id === 'svc_door_install') || null;
  }
  if (nameLower.includes('плитк') || nameLower.includes('керамогранит')) {
    return allServices.find((s) => s.id === 'svc_tile_install') || null;
  }
  if (product.category) {
    return allServices.find((s) => s.category === product.category) || null;
  }
  return allServices[0] || null;
}

/**
 * Groups cart items into separate checks by installation service.
 * Products that are subject to installation and belong to DIFFERENT services are ALWAYS split into separate checks.
 * Accompanying consumables/kit items (e.g. underlayment + baseboard for laminate, or sealant for faucet)
 * are grouped with their matching service check.
 */
export function groupCartIntoServiceChecks(
  items: CartItem[],
  forceIncludeServiceTariff = false
): CartChecksBreakdown {
  if (!items || items.length === 0) {
    return {
      serviceChecks: [],
      standaloneGoodsItems: [],
      standaloneGoodsTotal: 0,
      hasMultipleChecks: false,
    };
  }

  const serviceMap = new Map<
    string,
    { service: Service; items: CartItem[]; hasExplicitInstall: boolean }
  >();
  const nonInstallableItems: CartItem[] = [];

  // 1. Group all items that have an explicit installService OR are installable products
  for (const item of items) {
    const explicitSvc = item.installService || null;
    const resolvedSvc =
      explicitSvc || (item.product.installable ? resolveServiceForProduct(item.product) : null);

    if (resolvedSvc) {
      const existing = serviceMap.get(resolvedSvc.id);
      if (existing) {
        existing.items.push(item);
        if (explicitSvc) existing.hasExplicitInstall = true;
      } else {
        serviceMap.set(resolvedSvc.id, {
          service: resolvedSvc,
          items: [item],
          hasExplicitInstall: Boolean(explicitSvc),
        });
      }
    } else {
      nonInstallableItems.push(item);
    }
  }

  // 2. Attach non-installable consumables (sealants, siphons, underlayment, etc.) to matching service check
  const remainingStandalone: CartItem[] = [];

  for (const item of nonInstallableItems) {
    let attached = false;

    if (item.product.serviceId && serviceMap.has(item.product.serviceId)) {
      serviceMap.get(item.product.serviceId)!.items.push(item);
      attached = true;
    } else if (serviceMap.size > 0) {
      for (const group of serviceMap.values()) {
        if (group.service.category === item.product.category) {
          group.items.push(item);
          attached = true;
          break;
        }
      }
    }

    if (!attached) {
      remainingStandalone.push(item);
    }
  }

  // 3. Build ServiceCheckGroup list
  const serviceChecks: ServiceCheckGroup[] = [];
  let idx = 1;

  for (const { service, items: groupItems, hasExplicitInstall } of serviceMap.values()) {
    const isServiceActive = hasExplicitInstall || forceIncludeServiceTariff;
    const goodsTotal = Number(
      groupItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0).toFixed(2)
    );
    const serviceTotal = isServiceActive ? Number(service.price.toFixed(2)) : 0;
    const total = Number((goodsTotal + serviceTotal).toFixed(2));
    const bonusesEarned = Math.round(
      goodsTotal * BONUS_RATE_GOODS + serviceTotal * BONUS_RATE_SERVICE
    );

    serviceChecks.push({
      checkNumber: idx++,
      service,
      items: groupItems,
      isServiceActive,
      goodsTotal,
      serviceTotal,
      total,
      bonusesEarned,
    });
  }

  const standaloneGoodsTotal = Number(
    remainingStandalone.reduce((sum, i) => sum + i.product.price * i.quantity, 0).toFixed(2)
  );

  const hasMultipleChecks =
    serviceChecks.length > 1 ||
    (serviceChecks.length === 1 && remainingStandalone.length > 0);

  return {
    serviceChecks,
    standaloneGoodsItems: remainingStandalone,
    standaloneGoodsTotal,
    hasMultipleChecks,
  };
}
