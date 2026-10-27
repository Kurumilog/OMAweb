import React, { useState, useMemo } from 'react';
import {
  X,
  Check,
  Wrench,
  Hammer,
  ShieldCheck,
  Sparkles,
  Calculator,
  ShoppingCart,
} from 'lucide-react';
import { Task, Product, Service } from '../types';
import productsData from '../data/products.json';
import servicesData from '../data/services.json';
import { useCart } from '../context/CartContext';
import { formatBYN } from '../config/loyalty';

const allProducts = productsData as Product[];
const allServices = servicesData as Service[];

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose }) => {
  const { addBundle } = useCart();
  const [mode, setMode] = useState<'diy' | 'rental' | 'master'>('master');

  const [roomLength, setRoomLength] = useState(4);
  const [roomWidth, setRoomWidth] = useState(3);
  const [roomHeight, setRoomHeight] = useState(2.7);
  const [selectedBundleItems, setSelectedBundleItems] = useState<{ [productId: string]: boolean }>({});

  const wallArea = useMemo(() => {
    const perimeter = 2 * (roomLength + roomWidth);
    const grossArea = perimeter * roomHeight;
    return Math.round(grossArea * 0.85);
  }, [roomLength, roomWidth, roomHeight]);

  const paintLiters = useMemo(() => Math.ceil(wallArea * 0.22), [wallArea]);
  const primerLiters = useMemo(() => Math.ceil(wallArea * 0.12), [wallArea]);

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

  const bundleProducts = useMemo(() => {
    if (!task) return [];
    const list: { product: Product; qty: number; checked: boolean }[] = [];

    task.bundle.forEach((bItem) => {
      const found =
        allProducts.find((p) => {
          const matchesCat =
            p.category === bItem.category || p.categoryPath?.toLowerCase().includes(bItem.category);
          const matchesFilter =
            p.name.toLowerCase().includes(bItem.filter.toLowerCase()) ||
            p.subCategory?.toLowerCase().includes(bItem.filter.toLowerCase());
          return matchesCat && matchesFilter;
        }) || allProducts.find((p) => p.name.toLowerCase().includes(bItem.filter.toLowerCase()));

      if (found) {
        let calculatedQty = bItem.qty;
        if (task.id === 'pokrasit-komnatu') {
          if (bItem.filter === 'краска') calculatedQty = Math.max(1, Math.ceil(paintLiters / 5));
          if (bItem.filter === 'грунтовка') calculatedQty = Math.max(1, Math.ceil(primerLiters / 5));
        }
        list.push({ product: found, qty: calculatedQty, checked: true });
      }
    });

    return list;
  }, [task, paintLiters, primerLiters]);

  if (!task) return null;

  const toggleItem = (productId: string) => {
    setSelectedBundleItems((prev) => ({
      ...prev,
      [productId]: prev[productId] === undefined ? false : !prev[productId],
    }));
  };

  const activeProducts = bundleProducts.filter(
    (item) => selectedBundleItems[item.product.id] !== false
  );

  const goodsTotal = activeProducts.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const servicePrice = mode === 'master' && service ? service.price : 0;
  const rentalPrice = mode === 'rental' ? 24.0 : 0;
  const totalPrice = goodsTotal + servicePrice + rentalPrice;
  const estimatedBonuses = Math.round(goodsTotal * 0.05 + servicePrice * 0.03);

  const handleAddAllToCart = () => {
    const itemsToAdd = activeProducts.map((item) => ({
      product: item.product,
      qty: item.qty,
      withInstallation: mode === 'master',
    }));
    addBundle(itemsToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-oma-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-oma-border flex items-start justify-between bg-white">
          <div>
            <span className="inline-block text-xs font-semibold text-oma-blue bg-oma-blue-tint px-2.5 py-0.5 rounded-lg mb-1.5">
              Готовый сценарий
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-oma-text">{task.title}</h2>
            <p className="text-xs sm:text-sm text-oma-text-secondary mt-1">{task.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-oma-text-tertiary hover:text-oma-text hover:bg-oma-surface-alt transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Mode Switcher */}
          <div>
            <label className="block text-xs font-semibold text-oma-text-secondary mb-2">
              Способ выполнения
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('master')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'master'
                    ? 'border-oma-blue bg-oma-blue-tint'
                    : 'border-oma-border bg-white hover:bg-oma-bg'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-oma-blue" />
                  <span className="font-bold text-xs sm:text-sm text-oma-text">С мастером</span>
                </div>
                <div className="text-[11px] text-oma-text-secondary">
                  {service ? `+${service.price} руб.` : 'Мастер ОМА'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('diy')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'diy'
                    ? 'border-oma-blue bg-oma-blue-tint'
                    : 'border-oma-border bg-white hover:bg-oma-bg'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <Hammer className="w-4 h-4 text-oma-text-secondary" />
                  <span className="font-bold text-xs sm:text-sm text-oma-text">Сделаю сам</span>
                </div>
                <div className="text-[11px] text-oma-text-secondary">Только товары</div>
              </button>

              <button
                type="button"
                onClick={() => setMode('rental')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'rental'
                    ? 'border-oma-blue bg-oma-blue-tint'
                    : 'border-oma-border bg-white hover:bg-oma-bg'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <Wrench className="w-4 h-4 text-oma-text-secondary" />
                  <span className="font-bold text-xs sm:text-sm text-oma-text">С прокатом</span>
                </div>
                <div className="text-[11px] text-oma-text-secondary">+24 руб./сутки</div>
              </button>
            </div>
          </div>

          {/* Area Calculator for Painting */}
          {task.calculator.type === 'area' && (
            <div className="p-4 rounded-2xl bg-oma-bg border border-oma-border">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="w-4 h-4 text-oma-blue" />
                <span className="text-xs font-bold text-oma-text">
                  Калькулятор площади и расхода материалов
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] text-oma-text-secondary mb-1">Длина (м)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={roomLength}
                    onChange={(e) => setRoomLength(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white border border-oma-border rounded-xl text-xs font-bold text-oma-text"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-oma-text-secondary mb-1">Ширина (м)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={roomWidth}
                    onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white border border-oma-border rounded-xl text-xs font-bold text-oma-text"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-oma-text-secondary mb-1">Высота (м)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={roomHeight}
                    onChange={(e) => setRoomHeight(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white border border-oma-border rounded-xl text-xs font-bold text-oma-text"
                  />
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-oma-border text-xs flex items-center justify-between">
                <div>
                  <span className="text-oma-text-secondary">Площадь стен:</span>{' '}
                  <span className="font-bold text-oma-text">{wallArea} м²</span>
                </div>
                <div>
                  <span className="text-oma-text-secondary">Краска (2 слоя):</span>{' '}
                  <span className="font-bold text-oma-blue">{paintLiters} л</span>
                </div>
              </div>
            </div>
          )}

          {/* Master Service Info */}
          {mode === 'master' && service && (
            <div className="p-4 rounded-2xl bg-oma-blue-tint border border-oma-blue/25 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-oma-text flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-oma-blue" />
                  <span>{service.title}</span>
                </span>
                <span className="font-bold text-oma-blue text-sm">
                  {formatBYN(service.price)}
                </span>
              </div>
              <div className="text-oma-text-secondary space-y-1">
                <div>Срок: {service.duration} • Гарантия ОМА: {service.warrantyMonths} мес.</div>
                <div>Входит: {service.includes.slice(0, 3).join(', ')}</div>
              </div>
            </div>
          )}

          {/* Bundle Products */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-oma-text-secondary">
                Необходимые материалы ({activeProducts.length})
              </span>
            </div>

            <div className="space-y-2">
              {bundleProducts.map((item) => {
                const isChecked = selectedBundleItems[item.product.id] !== false;
                return (
                  <div
                    key={item.product.id}
                    onClick={() => toggleItem(item.product.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                      isChecked
                        ? 'border-oma-border bg-white hover:border-oma-blue'
                        : 'border-oma-border/60 bg-oma-bg opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0 pr-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                          isChecked ? 'bg-oma-blue border-oma-blue text-white' : 'border-oma-border bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-11 h-11 object-contain rounded-lg bg-oma-bg p-1 shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-oma-text line-clamp-1">
                          {item.product.name}
                        </div>
                        <div className="text-[11px] text-oma-text-secondary mt-0.5">
                          {item.product.brand} • {item.qty} шт.
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-xs sm:text-sm text-oma-text">
                        {formatBYN(item.product.price * item.qty)}
                      </div>
                      <div className="text-[10px] text-oma-text-secondary">
                        {formatBYN(item.product.price)} / шт.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-oma-border bg-oma-bg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="text-xs text-oma-text-secondary flex items-center space-x-2">
              <span>Итого за набор:</span>
              <span className="font-semibold text-oma-blue inline-flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>+{estimatedBonuses} бонусов</span>
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-oma-text">
              {formatBYN(totalPrice)}
            </div>
          </div>

          <button
            onClick={handleAddAllToCart}
            className="w-full sm:w-auto px-6 py-3 bg-oma-blue hover:bg-oma-blue-hover text-white font-semibold rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Добавить всё в корзину</span>
          </button>
        </div>
      </div>
    </div>
  );
};
