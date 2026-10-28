import React, { useState, useMemo } from 'react';
import { Breadcrumbs, Button, Disclosure, SegmentedRadioGroup } from '@gravity-ui/uikit';
import { Task, Product, Service } from '../types';
import productsData from '../data/products.json';
import servicesData from '../data/services.json';
import { useCart } from '../context/CartContext';
import { calculateBonusPoints } from '../config/loyalty';

const allProducts = productsData as Product[];
const allServices = servicesData as Service[];

interface TaskPageProps {
  task: Task;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onGoToMasterFlow?: (serviceId: string) => void;
}

export const TaskPage: React.FC<TaskPageProps> = ({
  task,
  onBack,
  onSelectProduct,
}) => {
  const { addBundle } = useCart();
  const [mode, setMode] = useState<'master' | 'diy'>('master');

  // Калькулятор стен для покраски комнаты
  const [roomLength, setRoomLength] = useState(4);
  const [roomWidth, setRoomWidth] = useState(3);
  const [roomHeight, setRoomHeight] = useState(2.7);
  const [doorsCount, setDoorsCount] = useState(1);
  const [windowsCount, setWindowsCount] = useState(1);

  const isPaintRoom = task.id === 'pokrasit-komnatu';

  const wallArea = useMemo(() => {
    const perimeter = 2 * (roomLength + roomWidth);
    const grossArea = perimeter * roomHeight;
    const openingsArea = doorsCount * 2.0 + windowsCount * 1.5;
    return Math.max(Math.round(grossArea - openingsArea), 5);
  }, [roomLength, roomWidth, roomHeight, doorsCount, windowsCount]);

  const paintLiters = useMemo(() => Math.ceil(wallArea * 0.22), [wallArea]);
  const primerLiters = useMemo(() => Math.ceil(wallArea * 0.12), [wallArea]);

  // Привязанная услуга мастера
  const service = useMemo(() => {
    if (!task) return null;
    if (task.id === 'zamenit-smesitel') return allServices.find((s) => s.id === 'svc_faucet_install');
    if (task.id === 'pokrasit-komnatu') return allServices.find((s) => s.id === 'svc_wall_painting');
    if (task.id === 'povesit-svetilnik') return allServices.find((s) => s.id === 'svc_lighting_install');
    if (task.id === 'ulozhit-laminat') return allServices.find((s) => s.id === 'svc_laminate_install');
    if (task.id === 'sobrat-mebel') return allServices.find((s) => s.id === 'svc_furniture_assembly');
    if (task.id === 'obnovit-vannuyu') return allServices.find((s) => s.id === 'svc_toilet_install');
    return null;
  }, [task]);

  // Товары комплекта из tasks.json
  const resolvedProducts = useMemo(() => {
    if (!task || !task.bundle) return [];
    const list: { product: Product; defaultQty: number }[] = [];

    task.bundle.forEach((bItem: any) => {
      const found =
        (bItem.productId ? allProducts.find((p) => p.id === bItem.productId) : undefined) ||
        allProducts.find((p) => {
          const matchesCat =
            p.category === bItem.category || p.categoryPath?.toLowerCase().includes(bItem.category);
          const filterLower = (bItem.filter || '').toLowerCase();
          const matchesFilter =
            p.name.toLowerCase().includes(filterLower) ||
            p.subCategory?.toLowerCase().includes(filterLower);
          return matchesCat && matchesFilter;
        }) ||
        allProducts.find((p) => (bItem.filter ? p.name.toLowerCase().includes(bItem.filter.toLowerCase()) : false));

      if (found) {
        let defaultQty = bItem.qty || bItem.quantity || 1;
        if (task.id === 'pokrasit-komnatu') {
          if (bItem.filter === 'краска') defaultQty = Math.max(1, Math.ceil(paintLiters / 5));
          if (bItem.filter === 'грунтовка') defaultQty = Math.max(1, Math.ceil(primerLiters / 5));
        }
        list.push({ product: found, defaultQty });
      }
    });

    if (list.length === 0) {
      // Smart semantic fallback based on task context — NEVER arbitrary bath faucets!
      const smartMatches = allProducts.filter((p) => {
        const pName = p.name.toLowerCase();
        if (task.id === 'sobrat-mebel') {
          return pName.includes('мойк') || pName.includes('кухн') || pName.includes('сифон');
        }
        if (task.id === 'obnovit-vannuyu') {
          return pName.includes('ванн') || pName.includes('умывальник') || pName.includes('раковин');
        }
        if (task.id === 'zamenit-smesitel') {
          return pName.includes('смеситель');
        }
        if (task.id === 'povesit-svetilnik') {
          return pName.includes('светильник') || pName.includes('люстра') || pName.includes('лампа');
        }
        if (task.id === 'ulozhit-laminat') {
          return pName.includes('ламинат') || pName.includes('подложк') || pName.includes('плинтус');
        }
        return false;
      }).slice(0, 3);

      smartMatches.forEach((p) => list.push({ product: p, defaultQty: 1 }));
    }

    return list;
  }, [task, paintLiters, primerLiters]);

  const [quantities, setQuantities] = useState<{ [id: string]: number }>({});

  const bundleItems = useMemo(() => {
    return resolvedProducts.map(({ product, defaultQty }) => {
      const qty = quantities[product.id] !== undefined ? quantities[product.id] : defaultQty;
      return {
        product,
        quantity: qty,
      };
    });
  }, [resolvedProducts, quantities]);

  const productsTotal = useMemo(() => {
    return bundleItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [bundleItems]);

  const servicePrice = useMemo(() => {
    if (mode === 'diy' || !service) return 0;
    if (isPaintRoom) {
      return Math.round(wallArea * (service.price / 20));
    }
    return service.price;
  }, [mode, service, isPaintRoom, wallArea]);

  const grandTotal = productsTotal + servicePrice;
  const totalBonuses = calculateBonusPoints(grandTotal);

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] !== undefined ? prev[productId] : 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const [bundleAdded, setBundleAdded] = useState(false);

  const handleAddAllToCart = () => {
    const productsToAdd = bundleItems.map((b) => ({
      product: b.product,
      qty: b.quantity,
      withInstallation: mode === 'master',
    }));

    addBundle(productsToAdd, mode === 'master' ? service : null);
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 3000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Хлебные крошки — Figma node 51011:69905 */}
      <Breadcrumbs>
        <Breadcrumbs.Item onClick={onBack}>Главная</Breadcrumbs.Item>
        <Breadcrumbs.Item onClick={onBack}>Готовые задачи</Breadcrumbs.Item>
        <Breadcrumbs.Item>{task.title}</Breadcrumbs.Item>
      </Breadcrumbs>

      {/* Заголовок — Figma node 51011:69929 */}
      <div className="space-y-2">
        <h1 className="text-[32px] md:text-[40px] font-medium leading-[48px] text-[#111111]">
          {task.title}
        </h1>
        <p className="text-[17px] leading-[24px] text-[#6E6E73]">
          {task.description}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Левая колонка комплекта — Figma node 51011:69933 */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* Переключатель: «С мастером» / «Сделаю сам» — Figma node 51011:69934 */}
          <div className="bg-white p-2 rounded-[16px] border border-[#E2E4E8] inline-flex items-center">
            <SegmentedRadioGroup
              value={mode}
              onUpdate={(v) => setMode(v as 'master' | 'diy')}
              size="l"
            >
              <SegmentedRadioGroup.Option value="master" content="С мастером" />
              <SegmentedRadioGroup.Option value="diy" content="Сделаю сам" />
            </SegmentedRadioGroup>
          </div>

          {/* Калькулятор площади комнаты (для задачи покраски) — Figma node 51011:70227 */}
          {isPaintRoom && (
            <div className="bg-white p-6 rounded-[24px] border border-[#E2E4E8] space-y-4">
              <h3 className="text-[20px] font-medium text-[#111111]">
                Калькулятор параметров помещения
              </h3>
              <p className="text-[13px] text-[#6E6E73]">
                Укажите размеры комнаты для автоматического расчёта объёма краски и сметы работ мастера.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <div>
                  <label className="text-[11px] text-[#6E6E73] block mb-1">Длина, м</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={roomLength}
                    onChange={(e) => setRoomLength(parseFloat(e.target.value) || 1)}
                    className="w-full h-[40px] px-3 bg-[#F4F4F6] border border-[#E2E4E8] rounded-[10px] text-[15px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#6E6E73] block mb-1">Ширина, м</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={roomWidth}
                    onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 1)}
                    className="w-full h-[40px] px-3 bg-[#F4F4F6] border border-[#E2E4E8] rounded-[10px] text-[15px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#6E6E73] block mb-1">Высота, м</label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    value={roomHeight}
                    onChange={(e) => setRoomHeight(parseFloat(e.target.value) || 2.5)}
                    className="w-full h-[40px] px-3 bg-[#F4F4F6] border border-[#E2E4E8] rounded-[10px] text-[15px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#6E6E73] block mb-1">Двери (шт)</label>
                  <input
                    type="number"
                    min="0"
                    value={doorsCount}
                    onChange={(e) => setDoorsCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-[40px] px-3 bg-[#F4F4F6] border border-[#E2E4E8] rounded-[10px] text-[15px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#6E6E73] block mb-1">Окна (шт)</label>
                  <input
                    type="number"
                    min="0"
                    value={windowsCount}
                    onChange={(e) => setWindowsCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-[40px] px-3 bg-[#F4F4F6] border border-[#E2E4E8] rounded-[10px] text-[15px]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#EDF4FF] rounded-[12px] flex flex-wrap gap-4 text-[13px] text-[#005DD6]">
                <span>Площадь стен под покраску: <strong>{wallArea} м²</strong></span>
                <span>Краска (~2 слоя): <strong>~{paintLiters} л</strong></span>
                <span>Грунтовка: <strong>~{primerLiters} л</strong></span>
              </div>
            </div>
          )}

          {/* Панель «Что понадобится» — Figma node 51011:69982 */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E2E4E8] space-y-6">
            <h3 className="text-[24px] font-medium leading-[28px] text-[#111111]">
              Что понадобится
            </h3>

            {/* Список товаров */}
            <div className="divide-y divide-[#E2E4E8]">
              {bundleItems.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => onSelectProduct(product)}
                      className="w-[100px] h-[100px] rounded-[16px] bg-[#F4F4F6] p-2 shrink-0 cursor-pointer flex items-center justify-center overflow-hidden"
                    >
                      <img
                        src={product.image || '/logo_cropped.png'}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h4
                        onClick={() => onSelectProduct(product)}
                        className="text-[17px] font-medium leading-[24px] text-[#111111] hover:text-[#005DD6] cursor-pointer"
                      >
                        {product.name}
                      </h4>
                      <p className="text-[13px] text-[#6E6E73] mt-1">
                        {product.brand || 'ОМА'} · Арт. {product.sku || product.id} · В наличии
                      </p>
                      {/* Степпер количества */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-8 h-8 rounded-[8px] bg-[#ECEDF0] hover:bg-[#E2E4E8] text-[#111111] flex items-center justify-center font-bold cursor-pointer"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-[15px] font-medium">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-8 h-8 rounded-[8px] bg-[#ECEDF0] hover:bg-[#E2E4E8] text-[#111111] flex items-center justify-center font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <p className="text-[20px] font-medium text-[#111111]">
                      {(product.price * quantity).toFixed(2)} руб.
                    </p>
                    <p className="text-[13px] text-[#005DD6]">
                      +{calculateBonusPoints(product.price * quantity)} Б
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Блок установки — Figma node 51011:70033 */}
            {mode === 'master' && service && (
              <div className="pt-6 border-t border-[#E2E4E8] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[17px] font-medium leading-[24px] text-[#111111]">
                    {service.title} · {servicePrice.toFixed(2)} руб.
                  </h4>
                  <span className="text-[13px] text-[#005DD6] font-medium">
                    +{calculateBonusPoints(servicePrice)} Б за услугу
                  </span>
                </div>
                <p className="text-[15px] leading-[20px] text-[#6E6E73]">
                  В течение 1–3 дней · Гарантия 12 месяцев
                </p>

                {/* Раскрытия «Что входит» / «Что не входит» */}
                <div className="space-y-2 pt-2">
                  <Disclosure summary="Что входит в услугу">
                    <ul className="text-[13px] text-[#111111] list-disc list-inside space-y-1 p-2">
                      {service.includes?.map((inc: string, i: number) => (
                        <li key={i}>{inc}</li>
                      )) || (
                        <>
                          <li>Выезд сертифицированного мастера в согласованное время</li>
                          <li>Демонтаж старого оборудования и подготовка узлов</li>
                          <li>Монтаж, надёжная фиксация и подключение</li>
                          <li>Контрольная проверка на герметичность под давлением</li>
                          <li>Уборка рабочего мусора</li>
                        </>
                      )}
                    </ul>
                  </Disclosure>

                  <Disclosure summary="Что не входит в услугу">
                    <ul className="text-[13px] text-[#6E6E73] list-disc list-inside space-y-1 p-2">
                      {service.excludes?.map((exc: string, i: number) => (
                        <li key={i}>{exc}</li>
                      )) || (
                        <>
                          <li>Штробление стен и капитальный перенос труб</li>
                          <li>Сварочные работы по стоякам</li>
                          <li>Покупка дополнительных расходников вне заказа</li>
                        </>
                      )}
                    </ul>
                  </Disclosure>
                </div>

                <p className="text-[13px] text-[#6E6E73] pt-2">
                  Результат: качественно выполненная работа, проверенная безопасность и чистое рабочее место.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка сводки (344 px) — Figma node 51011:70110 */}
        <div className="w-full lg:w-[344px] shrink-0 bg-white p-6 rounded-[24px] border border-[#E2E4E8] space-y-5 sticky top-28">
          <h3 className="text-[24px] font-medium leading-[28px] text-[#111111]">
            Итого по задаче
          </h3>

          <div className="space-y-3 text-[15px]">
            <div className="flex items-center justify-between text-[#6E6E73]">
              <span>Товары ({bundleItems.length})</span>
              <span className="text-[#111111] font-medium">{productsTotal.toFixed(2)} руб.</span>
            </div>

            {mode === 'master' && service && (
              <div className="flex items-center justify-between text-[#6E6E73]">
                <span>Услуга мастера</span>
                <span className="text-[#111111] font-medium">{servicePrice.toFixed(2)} руб.</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E2E4E8] space-y-1">
            <div className="text-[28px] font-medium text-[#111111]">
              {grandTotal.toFixed(2)} руб.
            </div>
            <p className="text-[15px] text-[#005DD6] font-medium">
              +{totalBonuses} Б после покупки и приёмки
            </p>
          </div>

          <Button
            type="button"
            view="action"
            size="l"
            width="max"
            onClick={handleAddAllToCart}
            className="!h-[52px] !rounded-[12px] !text-[15px] !bg-[#005DD6] hover:!bg-[#004EB8] !text-white !font-medium !w-full !px-3 sm:!px-4 transition-colors shadow-xs"
          >
            <span className="truncate">Добавить всё в корзину</span>
          </Button>

          {bundleAdded && (
            <div className="p-3 bg-[#EDF9F0] border border-[#2D8B5D]/30 rounded-[12px] text-center text-[#2D8B5D] text-[13px] font-semibold animate-fadeIn">
              ✓ Комплект задачи добавлен в корзину!
            </div>
          )}

          <p className="text-[13px] text-[#6E6E73] text-center">
            Фиксированная цена работы и официальная гарантия 12 месяцев.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
