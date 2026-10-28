import { Product } from '../types/index';
import productsData from '../data/products.json';

const allProducts = productsData as Product[];

export interface CartRecommendation {
  id: string;
  categoryKey: string;
  title: string;
  reason: string;
  product: Product;
}

interface CompanionRule {
  categoryKey: string;
  matches: (productText: string, category: string, subCategory: string) => boolean;
  candidates: {
    productId: string;
    title: string;
    reason: string;
  }[];
}

const COMPANION_RULES: CompanionRule[] = [
  // 1. Унитазы, инсталляции, компакты и биде (приоритетное совпадение до общей сантехники!)
  {
    categoryKey: 'toilets',
    matches: (text, _cat, sub) =>
      text.includes('унитаз') ||
      text.includes('инсталляц') ||
      text.includes('биде') ||
      text.includes('бачок') ||
      text.includes('чаша') ||
      sub.includes('унитаз'),
    candidates: [
      {
        productId: 'p_1141322', // Герметик WUNDER санитарный
        title: 'Санитарный силикон под подошву унитаза',
        reason:
          'Санитарный силикон WUNDER с антигрибковыми добавками наносится по контуру подошвы чаши: предотвращает микролюфты и качание на плитке, защищает от затекания воды при уборке и блокирует запахи.',
      },
      {
        productId: 'p_1466030', // Гофра для унитаза армированная D110мм
        title: 'Армированная фановая гофра 110 мм',
        reason:
          'Усиленная армированная гофра D110 мм обеспечивает герметичное и надёжное подключение выпуска унитаза к канализации без риска заломов.',
      },
      {
        productId: 'p_1145361', // Крепление для унитаза к полу
        title: 'Комплект усиленного крепежа к полу',
        reason:
          'Специальные сантехнические антикоррозийные болты МастерПроф с дюбелями и декоративными заглушками для надёжной фиксации чаши.',
      },
    ],
  },

  // 2. Ванны, душевые кабины и поддоны
  {
    categoryKey: 'bathtub_shower',
    matches: (text, _cat, sub) =>
      text.includes('ванн') ||
      text.includes('поддон') ||
      text.includes('кабин') ||
      sub.includes('ванн'),
    candidates: [
      {
        productId: 'p_1141322', // Герметик WUNDER санитарный
        title: 'Антигрибковый герметик для бортиков ванны',
        reason:
          'Санитарный силикон WUNDER с фунгицидом защищает стык ванны и поддона со стеной от протечек воды и образования чёрной плесени.',
      },
      {
        productId: 'p_1151028', // Шланг для душа 1.5м Люкс
        title: 'Шланг для душа с защитой от перекручивания',
        reason:
          'Усиленный шланг 1.5 м с латунными штуцерами 1/2" и надёжной защитой от заломов для долговечной службы.',
      },
      {
        productId: 'p_1151730', // Прокладки МастерПроф 2мм
        title: 'Комплект уплотнительных прокладок 2 мм',
        reason:
          'Эластичная сантехническая резина МастерПроф для надёжной герметизации душевых соединений и сифона.',
      },
    ],
  },

  // 3. Раковины, мойки, умывальники
  {
    categoryKey: 'sink_basin',
    matches: (text, _cat, sub) =>
      text.includes('мойк') ||
      text.includes('раковин') ||
      text.includes('умывальник') ||
      sub.includes('мойк') ||
      sub.includes('раковин'),
    candidates: [
      {
        productId: 'p_1141322', // Герметик WUNDER санитарный
        title: 'Герметик для монтажа раковины / мойки',
        reason:
          'Санитарный силикон WUNDER защищает выпил кухонной столешницы от разбухания и герметизирует примыкание раковины к стене.',
      },
      {
        productId: 'p_1151730', // Прокладки 2мм
        title: 'Комплект сантехнических прокладок',
        reason:
          'Усиленные прокладки МастерПроф для надёжного монтажа сифона, слива-перелива и подключения смесителя.',
      },
    ],
  },

  // 4. Смесители, краны и изливы
  {
    categoryKey: 'faucets',
    matches: (text, _cat, sub) =>
      text.includes('смесител') ||
      text.includes('кран') ||
      text.includes('излив') ||
      sub.includes('смесител'),
    candidates: [
      {
        productId: 'p_1141322', // Герметик WUNDER
        title: 'Санитарный силикон под смеситель',
        reason:
          'Герметизирует посадочное отверстие смесителя на мойке или умывальнике, предотвращая затекание капель под раковину.',
      },
      {
        productId: 'p_1151730', // Прокладки 2мм
        title: 'Комплект уплотнительных прокладок 2 мм',
        reason:
          'Усиленная сантехническая резина МастерПроф взамен тонких комплектных прокладок из коробки.',
      },
      {
        productId: 'p_1151028', // Шланг для душа
        title: 'Гибкий шланг с защитой от заломов',
        reason:
          'Усиленный шланг 1.5 м с латунными штуцерами 1/2" для долговечной службы.',
      },
    ],
  },

  // 5. Освещение и электрика (светильники, люстры, бра, споты)
  {
    categoryKey: 'lighting',
    matches: (text, cat, sub) =>
      cat === 'elektrika' ||
      text.includes('светильн') ||
      text.includes('люстр') ||
      text.includes('бра') ||
      text.includes('спот') ||
      sub.includes('светильник') ||
      sub.includes('ламп'),
    candidates: [
      {
        productId: 'p_975979', // Лампа ASTRA E27
        title: 'Не забудьте лампочки к светильнику',
        reason:
          'Для проверки и подключения светильника понадобятся лампы с цоколем E27. Рекомендуем экономичные LED-лампы ASTRA с мягким тёплым светом.',
      },
      {
        productId: 'p_1374938', // Лампа PROLED E27
        title: 'Светодиодная лампа PROLED E27',
        reason:
          'Нейтральный белый свет 4000K с высоким индексом цветопередачи для комфортного освещения рабочих зон.',
      },
      {
        productId: 'p_1527497', // Кабель ВВГ-Пнг 3x1.5
        title: 'Монтажный кабель ВВГ-Пнг(А)-LS',
        reason:
          'Медный негорючий кабель по ГОСТ для надёжного и безопасного подключения светильников и выключателей.',
      },
    ],
  },

  // 6. Напольные покрытия (ламинат, линолеум, паркет)
  {
    categoryKey: 'flooring',
    matches: (text, _cat, sub) =>
      text.includes('ламинат') ||
      text.includes('линолеум') ||
      text.includes('паркет') ||
      sub.includes('ламинат') ||
      sub.includes('линолеум'),
    candidates: [
      {
        productId: 'p_1115682', // Подложка GRACE 3мм
        title: 'Не забудьте подложку под ламинат',
        reason:
          'Подложка 3 мм компенсирует неровности основания, гасит шум шагов и защищает замковые соединения от скрипа.',
      },
      {
        productId: 'p_1299512', // Плинтус Идеал
        title: 'Напольный плинтус с кабель-каналом',
        reason:
          'Закрывает технологический зазор у стен и позволяет аккуратно скрыть провода по периметру комнаты.',
      },
      {
        productId: 'p_284556', // Подложка ИТЭП 5мм
        title: 'Усиленная подложка ИТЭП 5 мм',
        reason:
          'Утолщенная подложка для повышенной тепло- и звукоизоляции межэтажных перекрытий.',
      },
    ],
  },

  // 7. Лакокрасочные материалы и подготовка стен (краска, эмаль, шпаклёвка)
  {
    categoryKey: 'painting',
    matches: (text, _cat, sub) =>
      text.includes('краск') ||
      text.includes('эмаль') ||
      text.includes('грунтовк') ||
      text.includes('шпатлевк') ||
      sub.includes('краск') ||
      sub.includes('эмали'),
    candidates: [
      {
        productId: 'p_303756', // Грунтовка WUNDER 5кг
        title: 'Рекомендуем грунтовку под покраску',
        reason:
          'Грунтовка глубокого проникновения обеспыливает основание, снижает расход краски в 1.5 раза и обеспечивает равномерный цвет.',
      },
      {
        productId: 'p_1360891', // Акриловый герметик MasterTeks
        title: 'Акриловый герметик под покраску',
        reason:
          'Эластичный акрил для заделки щелей и примыканий плинтусов и откосов; отлично окрашивается любыми красками.',
      },
      {
        productId: 'p_501312', // Грунтовка Ceresit CT17 10л
        title: 'Грунтовка-концентрат Ceresit CT 17',
        reason:
          'Профессиональный состав для сильно впитывающих минеральных оснований и штукатурки.',
      },
    ],
  },

  // 8. Двери и окна (дверные полотна, коробки, окна)
  {
    categoryKey: 'doors',
    matches: (text, _cat, sub) =>
      text.includes('двер') ||
      text.includes('коробк') ||
      text.includes('добор') ||
      text.includes('окн') ||
      sub.includes('двери'),
    candidates: [
      {
        productId: 'p_303822', // Пена WUNDER Foam 750мл
        title: 'Монтажная пена для дверей и окон',
        reason:
          'Профессиональная пена WUNDER с низким вторичным расширением надёжно фиксирует дверной короб без деформаций.',
      },
      {
        productId: 'p_285958', // Пена Soudal Окна Двери
        title: 'Пена пистолетная SOUDAL Окна Двери',
        reason:
          'Бельгийская полиуретановая пена с высокой адгезией и плотной однородной структурой.',
      },
    ],
  },

  // 9. Керамическая плитка, керамогранит и мозаика
  {
    categoryKey: 'tiles',
    matches: (text, _cat, sub) =>
      text.includes('плитк') ||
      text.includes('керамогранит') ||
      text.includes('мозаик') ||
      sub.includes('плитка'),
    candidates: [
      {
        productId: 'p_285063', // Клей-герметик Soudal Fix All
        title: 'Гибридный полимер Soudal Fix All',
        reason:
          'Суперпрочный клей-герметик для монтажа декоративных панелей, полок, зеркал и керамики во влажных зонах.',
      },
      {
        productId: 'p_1141322', // Герметик WUNDER санитарный
        title: 'Санитарный силикон для межплиточных стыков',
        reason:
          'Силикон с фунгицидом для герметизации деформационных швов плитки во внутренних углах и зонах прямого контакта с водой.',
      },
    ],
  },
];

// Fallback recommendation when cart has generic items
const GENERAL_FALLBACK: { productId: string; title: string; reason: string } = {
  productId: 'p_1482673', // Рулетка Werker 7.5м
  title: 'Удобная рулетка 7.5 м для точных замеров',
  reason:
    'Компактная рулетка с надёжным фиксатором и прорезиненным корпусом — пригодится при любых монтажных работах.',
};

/**
 * Resolves smart, adaptive recommendations based on the actual products in the cart.
 * Never suggests a product that is already present in the cart.
 */
export function getAdaptiveCartRecommendations(
  cartProducts: { id: string; name: string; category?: string; subCategory?: string }[]
): CartRecommendation[] {
  if (!cartProducts || cartProducts.length === 0) return [];

  const cartIds = new Set(cartProducts.map((p) => p.id));
  const results: CartRecommendation[] = [];
  const processedCategories = new Set<string>();

  // Find matching rules for items in the cart
  for (const item of cartProducts) {
    const text = (item.name || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    const sub = (item.subCategory || '').toLowerCase();

    const matchedRule = COMPANION_RULES.find((rule) => rule.matches(text, cat, sub));
    if (!matchedRule) continue;
    if (processedCategories.has(matchedRule.categoryKey)) continue;

    // Find candidates not yet in the cart and not yet in results
    const matchingCandidates = matchedRule.candidates.filter(
      (c) => !cartIds.has(c.productId) && !results.some((r) => r.product.id === c.productId)
    );

    for (const candidate of matchingCandidates) {
      const prod = allProducts.find((p) => p.id === candidate.productId);
      if (prod) {
        results.push({
          id: `rec_${candidate.productId}_${matchedRule.categoryKey}`,
          categoryKey: matchedRule.categoryKey,
          title: candidate.title,
          reason: candidate.reason,
          product: prod,
        });
        processedCategories.add(matchedRule.categoryKey);
        break;
      }
    }

    if (results.length >= 2) break;
  }

  // If no category-specific rule matched or all candidates are already in cart, check fallback
  if (results.length === 0) {
    if (!cartIds.has(GENERAL_FALLBACK.productId)) {
      const fallbackProd = allProducts.find((p) => p.id === GENERAL_FALLBACK.productId);
      if (fallbackProd) {
        results.push({
          id: `rec_${GENERAL_FALLBACK.productId}_general`,
          categoryKey: 'general',
          title: GENERAL_FALLBACK.title,
          reason: GENERAL_FALLBACK.reason,
          product: fallbackProd,
        });
      }
    }
  }

  return results;
}
