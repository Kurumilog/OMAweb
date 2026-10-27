import productsData from '../data/products.json';
import { Product } from '../types';

const rawProducts = productsData as Product[];

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

function buildShuffledUniqueCatalog(): Product[] {
  const seenIds = new Set<string>();
  const seenSkus = new Set<string>();
  const seenNames = new Set<string>();
  const unique: Product[] = [];

  for (const p of rawProducts) {
    const idKey = (p.id || '').trim();
    const skuKey = (p.sku || '').trim();
    const nameKey = (p.name || '').trim().toLowerCase();

    if (!idKey || seenIds.has(idKey)) continue;
    if (skuKey && seenSkus.has(skuKey)) continue;
    if (nameKey && seenNames.has(nameKey)) continue;

    seenIds.add(idKey);
    if (skuKey) seenSkus.add(skuKey);
    if (nameKey) seenNames.add(nameKey);
    unique.push(p);
  }

  let shuffled = shuffleArray(unique);

  // Следим, чтобы при перезагрузке страницы первые карточки не повторяли предыдущую выдачу
  try {
    const storageKey = 'oma_prev_top_product_ids';
    const prevRaw = sessionStorage.getItem(storageKey);
    const prevIds = new Set<string>(prevRaw ? JSON.parse(prevRaw) : []);

    if (prevIds.size > 0 && shuffled.length > 16) {
      const freshFirst: Product[] = [];
      const deferred: Product[] = [];
      for (const item of shuffled) {
        if (prevIds.has(item.id) && freshFirst.length < 16) {
          deferred.push(item);
        } else {
          freshFirst.push(item);
        }
      }
      shuffled = [...freshFirst, ...deferred];
    }

    const currentTopIds = shuffled.slice(0, 12).map((p) => p.id);
    sessionStorage.setItem(storageKey, JSON.stringify(currentTopIds));
  } catch {
    // ignore sessionStorage errors in private mode
  }

  return shuffled;
}

export const SHUFFLED_PRODUCTS: Product[] = buildShuffledUniqueCatalog();
