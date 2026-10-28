import { Product, Service } from '../types';
import { CabinetOrder } from '../components/OrderCabinetPage';
import { ApplicationOrderData } from '../components/MasterApplicationPage';
import { saveOrderMemory } from './supermemory';

const STORAGE_ACTIVE_ORDER = 'oma_active_master_order';
const STORAGE_ORDERS_HISTORY = 'oma_master_orders_history';
const STORAGE_SERVICE_PRODUCTS = 'oma_service_product_memory';

export interface ServiceProductMemoryItem {
  serviceId: string;
  productId?: string;
  product?: Product;
  productSource: 'oma' | 'own';
  updatedAt: string;
}

/**
 * Save newly submitted master application to memory (localStorage + Supermemory)
 */
export function saveActiveMasterOrder(orderData: ApplicationOrderData, currentProduct?: Product | null): CabinetOrder {
  const newOrder: CabinetOrder = {
    id: 'ord_' + Math.floor(10000 + Math.random() * 90000),
    orderNumber: String(Math.floor(10000 + Math.random() * 90000)),
    status: 'on_the_way',
    serviceTitle: orderData.service.title,
    serviceId: orderData.service.id,
    serviceCategory: orderData.service.category,
    serviceCategoryLabel: orderData.service.categoryLabel,
    productName: orderData.productName || (currentProduct ? currentProduct.name : undefined),
    materialPhotos: orderData.materialPhotos && orderData.materialPhotos.length > 0 ? orderData.materialPhotos : undefined,
    materialDescription: orderData.materialDescription,
    sitePhotos: orderData.photos && orderData.photos.length > 0 ? orderData.photos : undefined,
    address: `${orderData.address.city}, ${orderData.address.street}, д. ${orderData.address.house}, кв. ${orderData.address.apt}`,
    dateTime: `${orderData.date} · ${orderData.timeSlot}`,
    goodsPrice: orderData.productPrice || 0,
    servicePrice: orderData.service.price * orderData.quantity,
    deliveryPrice: 8.0,
    discountBonus: orderData.useBonuses,
    totalPrice: orderData.totalPrice,
    earnedBonuses: Math.round(orderData.totalPrice * 0.08),
    master: {
      name: 'Алексей С.',
      initials: 'АС',
      avatar: '/master.jpeg',
      rating: 4.9,
      completedOrders: 248,
      phone: '+375 (29) 765-43-21',
    },
  };

  try {
    localStorage.setItem(STORAGE_ACTIVE_ORDER, JSON.stringify(newOrder));

    const existingHistoryRaw = localStorage.getItem(STORAGE_ORDERS_HISTORY);
    const history: CabinetOrder[] = existingHistoryRaw ? JSON.parse(existingHistoryRaw) : [];
    const updatedHistory = [newOrder, ...history.filter((o) => o.id !== newOrder.id)].slice(0, 10);
    localStorage.setItem(STORAGE_ORDERS_HISTORY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error('Failed to save order to localStorage', e);
  }

  // Sync to Supermemory RAG
  try {
    saveOrderMemory('u_current', {
      id: newOrder.orderNumber,
      category: newOrder.serviceCategoryLabel || newOrder.serviceTitle,
      address: newOrder.address,
      timeWindow: newOrder.dateTime,
      status: 'Мастер в пути',
      masterName: newOrder.master.name,
      total: newOrder.totalPrice,
      items: [
        {
          name: newOrder.serviceTitle,
          quantity: 1,
          price: newOrder.servicePrice,
          install: true,
        },
        ...(newOrder.productName
          ? [
              {
                name: newOrder.productName,
                quantity: 1,
                price: newOrder.goodsPrice,
                install: false,
              },
            ]
          : []),
      ],
    });
  } catch (e) {
    console.warn('Supermemory sync error:', e);
  }

  return newOrder;
}

/**
 * Retrieve the active master order from memory
 */
export function getActiveMasterOrder(): CabinetOrder | null {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_ORDER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load active order from localStorage', e);
  }
  return null;
}

/**
 * Retrieve all past master applications from memory
 */
export function getMasterOrdersHistory(): CabinetOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load orders history', e);
  }
  return [];
}

/**
 * Remember what product / source the user chose for a given service
 */
export function saveServiceProductMemory(
  serviceId: string,
  product: Product | null,
  productSource: 'oma' | 'own'
) {
  try {
    const raw = localStorage.getItem(STORAGE_SERVICE_PRODUCTS);
    const map: Record<string, ServiceProductMemoryItem> = raw ? JSON.parse(raw) : {};
    map[serviceId] = {
      serviceId,
      productId: product?.id,
      product: product || undefined,
      productSource,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_SERVICE_PRODUCTS, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save service product memory', e);
  }
}

/**
 * Retrieve remembered product and source for a service
 */
export function getServiceProductMemory(serviceId: string): ServiceProductMemoryItem | null {
  try {
    const raw = localStorage.getItem(STORAGE_SERVICE_PRODUCTS);
    if (raw) {
      const map: Record<string, ServiceProductMemoryItem> = JSON.parse(raw);
      return map[serviceId] || null;
    }
  } catch (e) {
    console.error('Failed to load service product memory', e);
  }
  return null;
}
