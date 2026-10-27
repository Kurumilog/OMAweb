import type { UserProfile } from '../types';

export function userNamespace(userId: string): string {
  const safe = (userId || 'demo').replace(/[^a-zA-Z0-9_:-]/g, '_').slice(0, 80);
  return `user_${safe}`;
}

export interface SearchHit {
  id: string;
  memory?: string;
  chunk?: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

async function post<T>(route: string, payload: unknown): Promise<T | null> {
  try {
    const response = await fetch(`/api/supermemory/${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function searchUserMemory(
  userId: string,
  query: string,
  limit = 8
): Promise<SearchHit[] | null> {
  const data = await post<{ results: SearchHit[] }>('search', {
    namespace: userNamespace(userId),
    query,
    searchMode: 'hybrid',
    limit,
  });
  return data?.results ?? null;
}

export async function syncUserProfile(user: UserProfile): Promise<boolean> {
  const content = [
    'Профиль клиента ОМА.',
    `Имя: ${user.name || 'не указано'}.`,
    `Город: ${user.city}.`,
    `Телефон: ${user.phone}.`,
    `Карта лояльности: ${user.cardType}, уровень: ${user.level}.`,
    'Предпочтения: покупает товары для дома и ремонта, пользуется услугами мастера ОМА.',
  ].join(' ');

  const result = await post<{ id?: string }>('add', {
    namespace: userNamespace(user.id),
    id: `profile_${user.id}`,
    content,
    metadata: {
      type: 'profile',
      userId: user.id,
      name: user.name,
      city: user.city,
      level: user.level,
    },
    taskType: 'memory',
    dreaming: 'instant',
  });
  return Boolean(result);
}

export interface OrderMemory {
  id: string;
  category: string;
  address: string;
  timeWindow: string;
  status: string;
  masterName?: string;
  total?: number;
  items: { name: string; quantity: number; price: number; install: boolean }[];
}

export async function saveOrderMemory(userId: string, order: OrderMemory): Promise<boolean> {
  const itemLines = order.items.length
    ? order.items
        .map(
          (item) =>
            `${item.name} × ${item.quantity} — ${item.price} руб.${item.install ? ' (с установкой)' : ''}`
        )
        .join('; ')
    : 'пока без товаров';

  const content = [
    `Заказ мастера ОМА №${order.id}.`,
    `Категория работ: ${order.category}.`,
    `Адрес: ${order.address || 'не указан'}.`,
    `Окно времени: ${order.timeWindow || 'не выбрано'}.`,
    `Статус: ${order.status}.`,
    order.masterName ? `Мастер: ${order.masterName}.` : '',
    `Товары: ${itemLines}.`,
    typeof order.total === 'number' ? `Итоговая сумма: ${order.total} руб.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const result = await post<{ id?: string }>('add', {
    namespace: userNamespace(userId),
    id: `order_${order.id}`,
    content,
    metadata: {
      type: 'order',
      orderId: order.id,
      userId,
      category: order.category,
      status: order.status,
      master: order.masterName || '',
      total: order.total ?? 0,
    },
    taskType: 'memory',
    dreaming: 'instant',
  });
  return Boolean(result);
}

export interface ChatMessage {
  role: 'client' | 'master';
  text: string;
  createdAt: string;
}

export async function saveChatTranscript(
  userId: string,
  orderId: string,
  messages: ChatMessage[]
): Promise<boolean> {
  const latest = messages.slice(-2);
  const content = [
    `Переписка по заказу мастера №${orderId}.`,
    ...latest.map(
      (message) => `${message.role === 'client' ? 'Клиент' : 'Мастер ОМА'}: ${message.text}`
    ),
  ].join('\n');

  const result = await post<{ id?: string }>('add', {
    namespace: userNamespace(userId),
    id: `chat_${orderId}_${messages.length}`,
    content,
    metadata: {
      type: 'chat',
      orderId,
      userId,
    },
    taskType: 'memory',
    dreaming: 'instant',
  });
  return Boolean(result);
}

