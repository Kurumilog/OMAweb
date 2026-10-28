import React, { useState } from 'react';
import { Check } from '@gravity-ui/icons';
import { useUser } from '../context/UserContext';
import {
  REWARD_TIERS,
  INITIAL_MONTHLY_TASKS,
  MonthlyTask,
  ActiveCoupon,
} from '../config/loyalty';

interface LoyaltyPageProps {
  onGoToCatalog: () => void;
  onOpenMaster: () => void;
}

export const LoyaltyPage: React.FC<LoyaltyPageProps> = ({
  onGoToCatalog,
  onOpenMaster,
}) => {
  const { user, addActivityPoints, addActiveCoupon } = useUser();
  const [showBarcode, setShowBarcode] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const activityPoints = user.activityPoints ?? 6;
  const cashbackBalance = user.bonusBalance ?? 14.80;

  const [tasks, setTasks] = useState<MonthlyTask[]>(INITIAL_MONTHLY_TASKS);

  const [activeCoupons, setActiveCoupons] = useState<ActiveCoupon[]>(() => {
    return user.activeCoupons?.length
      ? user.activeCoupons
      : [
          {
            id: 'coupon_starter',
            code: 'RENT-30-START',
            title: 'Скидка 30% на сутки проката инструмента',
            discount: '30%',
            expiresInDays: 24,
            maxDiscountCap: 15,
            activatedAt: '24 октября 2026',
          },
        ];
  });

  const [selectedTier2Option, setSelectedTier2Option] = useState<string>('tier2_logistics');
  const [justClaimedReward, setJustClaimedReward] = useState<string | null>(null);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleClaimReward = (tierLevel: 1 | 2 | 3) => {
    const tier = REWARD_TIERS.find((t) => t.level === tierLevel);
    if (!tier) return;

    let chosenOption = tier.options[0];
    if (tierLevel === 2) {
      chosenOption = tier.options.find((o) => o.id === selectedTier2Option) || tier.options[0];
    }

    if (activeCoupons.some((c) => c.code === chosenOption.couponCode)) {
      setJustClaimedReward(`Купон ${chosenOption.couponCode} уже активен`);
      setTimeout(() => setJustClaimedReward(null), 2500);
      return;
    }

    const newCoupon: ActiveCoupon = {
      id: `coupon_${Date.now()}`,
      code: chosenOption.couponCode,
      title: chosenOption.title,
      discount: chosenOption.discountDisplay,
      expiresInDays: 30,
      minSpend: chosenOption.minSpend,
      maxDiscountCap: chosenOption.maxDiscountCap,
      activatedAt: 'Сегодня',
    };

    addActiveCoupon(newCoupon);
    setActiveCoupons((prev) => [newCoupon, ...prev]);
    setJustClaimedReward(`Купон ${chosenOption.couponCode} активирован на 30 дней`);
    setTimeout(() => setJustClaimedReward(null), 3000);
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && !t.completed) {
          addActivityPoints(1);
          return {
            ...t,
            completed: true,
            currentValue: t.targetValue,
            actionLabel: 'Выполнено',
          };
        }
        return t;
      })
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-5 pb-14 max-w-[1080px] mx-auto">
      {/* 1. Header — лаконичный и компактный */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">
            Программа лояльности
          </h1>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Кэшбэк 4% за покупки и баллы за задания месяца (баллы не равны рублям).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onGoToCatalog}
            className="h-9 px-4 rounded-xl bg-[#005DD6] hover:bg-[#0048A8] text-white font-medium text-xs transition-colors cursor-pointer"
          >
            В каталог
          </button>
          <button
            type="button"
            onClick={onOpenMaster}
            className="h-9 px-4 rounded-xl border border-[#E2E4E8] bg-white text-[#111111] hover:bg-[#F4F4F6] font-medium text-xs transition-colors cursor-pointer"
          >
            Вызвать мастера
          </button>
        </div>
      </div>

      {/* Alert toast */}
      {justClaimedReward && (
        <div className="p-3 bg-white border border-[#E2E4E8] rounded-xl flex items-center justify-between text-xs font-medium text-[#111111]">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#005DD6]" />
            <span>{justClaimedReward}</span>
          </div>
          <button
            type="button"
            onClick={() => setJustClaimedReward(null)}
            className="text-[11px] text-[#6E6E73] hover:text-[#111111] cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      )}

      {/* 2. Компактные балансы (Кэшбэк рублями VS Баллы активности) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Кэшбэк */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E4E8] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider">
              Кэшбэк за покупки
            </span>
            <span className="text-[11px] text-[#005DD6] font-medium bg-[#F0F5FD] px-2 py-0.5 rounded">
              Оплата до 20% чека
            </span>
          </div>

          <div>
            <div className="text-3xl font-bold text-[#111111]">
              {cashbackBalance.toFixed(2)} <span className="text-lg font-normal text-[#6E6E73]">руб.</span>
            </div>
            <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
              Начисляется деньгами: 4% за товары, 3% за мастера. Списывается в корзине.
            </p>
          </div>

          <div className="pt-2.5 border-t border-[#E2E4E8] flex items-center justify-between text-xs">
            <span className="text-[#6E6E73] text-[11px]">
              {user.phone}
            </span>
            <button
              type="button"
              onClick={() => setShowBarcode(!showBarcode)}
              className="text-[#005DD6] hover:underline text-xs font-medium cursor-pointer"
            >
              {showBarcode ? 'Скрыть штрихкод' : 'Штрихкод для кассы'}
            </button>
          </div>

          {showBarcode && (
            <div className="p-3 bg-[#F8F9FA] rounded-lg border border-[#E2E4E8] flex flex-col items-center">
              <div className="flex items-center gap-[2px] h-9 px-3 bg-white rounded border border-[#E2E4E8]">
                {[3, 2, 4, 2, 3, 4, 2, 3, 2, 5, 2, 4, 3, 2, 4, 2, 5, 2, 3].map((w, idx) => (
                  <div key={idx} className="bg-black h-6" style={{ width: `${w}px` }} />
                ))}
              </div>
              <span className="text-[11px] font-mono text-[#111111] mt-1.5">
                2900 1842 9104
              </span>
            </div>
          )}
        </div>

        {/* Баллы активности */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E4E8] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider">
              Баллы активности
            </span>
            <span className="text-[11px] text-[#111111] font-medium bg-[#F4F4F6] px-2 py-0.5 rounded">
              Уровень 2 (6 б.)
            </span>
          </div>

          <div>
            <div className="text-3xl font-bold text-[#111111]">
              {activityPoints} <span className="text-lg font-normal text-[#6E6E73]">баллов</span>
            </div>
            <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
              1 балл за каждое задание месяца. Баллы открывают лесенку скидок ниже.
            </p>
          </div>

          <div className="pt-2.5 border-t border-[#E2E4E8] flex items-center justify-between text-xs text-[#6E6E73]">
            <span>Срок жизни баллов: 6 месяцев</span>
            <span className="text-[#005DD6] font-medium">Открыто 6 б.</span>
          </div>
        </div>
      </div>

      {/* 3. ЛЕСЕНКА НАГРАД (3 / 6 / 10 баллов) с небольшими подписями */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E4E8] space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#111111]">
              Лесенка наград активности
            </h3>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Накопленные баллы дают купоны на 30 дней. Чем выше ступень — тем больше скидка.
            </p>
          </div>
          <span className="text-xs font-medium text-[#005DD6] bg-[#F0F5FD] px-2.5 py-1 rounded-lg">
            У вас {activityPoints} из 10 б.
          </span>
        </div>

        {/* Ступени лесенки (Staircase blocks: 170px -> 215px -> 260px) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end pt-2">
          {/* Ступень 1: 3 балла (нижняя ступень) */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 transition-colors ${
              activityPoints >= 3
                ? 'bg-[#F8F9FA] border-[#E2E4E8]'
                : 'bg-white border-[#E2E4E8] opacity-70'
            } md:min-h-[160px]`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#005DD6] bg-[#F0F5FD] px-1.5 py-0.5 rounded">
                  3 балла
                </span>
                <span className="text-[11px] text-[#2D8B5D] font-medium flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Достигнуто
                </span>
              </div>

              <h4 className="text-sm font-bold text-[#111111] pt-1">
                Прокат инструмента -30%
              </h4>
              <p className="text-xs text-[#6E6E73]">
                Сутки аренды в ОМА
              </p>
              <p className="text-[11px] text-[#9A9BA1]">
                потолок 15 руб. · 30 дней
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleClaimReward(1)}
              className="w-full rounded-lg h-8 text-xs bg-[#111111] hover:bg-[#222222] text-white font-medium transition-colors cursor-pointer"
            >
              Получить купон
            </button>
          </div>

          {/* Ступень 2: 6 баллов (средняя ступень, активная) */}
          <div className="p-3.5 rounded-xl border-2 border-[#005DD6] bg-white flex flex-col justify-between space-y-2.5 shadow-xs md:min-h-[215px]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white bg-[#005DD6] px-1.5 py-0.5 rounded">
                  6 баллов
                </span>
                <span className="text-[11px] text-[#005DD6] font-medium bg-[#F0F5FD] px-1.5 py-0.5 rounded">
                  Доступно к выбору
                </span>
              </div>

              <h4 className="text-sm font-bold text-[#111111]">
                1 купон на выбор:
              </h4>

              <div className="space-y-1 pt-0.5 text-xs">
                <label
                  onClick={() => setSelectedTier2Option('tier2_logistics')}
                  className={`p-2 rounded-lg border block cursor-pointer transition-colors ${
                    selectedTier2Option === 'tier2_logistics'
                      ? 'border-[#005DD6] bg-[#F0F5FD] font-medium text-[#111111]'
                      : 'border-[#E2E4E8] bg-[#F8F9FA] text-[#6E6E73]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Доставка/подъём -30%</span>
                    <input
                      type="radio"
                      name="step2_radio"
                      checked={selectedTier2Option === 'tier2_logistics'}
                      onChange={() => setSelectedTier2Option('tier2_logistics')}
                      className="accent-[#005DD6]"
                    />
                  </div>
                  <span className="text-[10px] text-[#6E6E73] block mt-0.5">
                    грузы &gt;30 кг или дача (кап 20 руб.)
                  </span>
                </label>

                <label
                  onClick={() => setSelectedTier2Option('tier2_repair_category')}
                  className={`p-2 rounded-lg border block cursor-pointer transition-colors ${
                    selectedTier2Option === 'tier2_repair_category'
                      ? 'border-[#005DD6] bg-[#F0F5FD] font-medium text-[#111111]'
                      : 'border-[#E2E4E8] bg-[#F8F9FA] text-[#6E6E73]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Товары ремонта -5%</span>
                    <input
                      type="radio"
                      name="step2_radio"
                      checked={selectedTier2Option === 'tier2_repair_category'}
                      onChange={() => setSelectedTier2Option('tier2_repair_category')}
                      className="accent-[#005DD6]"
                    />
                  </div>
                  <span className="text-[10px] text-[#6E6E73] block mt-0.5">
                    сантехника, ЛКМ, инструмент (кап 20 руб.)
                  </span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleClaimReward(2)}
              className="w-full rounded-lg h-8 text-xs bg-[#005DD6] hover:bg-[#0048A8] text-white font-medium transition-colors cursor-pointer"
            >
              Активировать (6 б.)
            </button>
          </div>

          {/* Ступень 3: 10 баллов (самая высокая ступень) */}
          <div className="p-3.5 rounded-xl border border-[#E2E4E8] bg-[#F8F9FA] flex flex-col justify-between space-y-2.5 md:min-h-[260px]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#6E6E73] bg-[#ECEDF0] px-1.5 py-0.5 rounded">
                  10 баллов
                </span>
                <span className="text-[11px] text-[#6E6E73] bg-[#ECEDF0] px-1.5 py-0.5 rounded">
                  Осталось 4 б.
                </span>
              </div>

              <h4 className="text-sm font-bold text-[#111111]">
                Максимум выгоды:
              </h4>

              <div className="space-y-1 pt-0.5 text-xs">
                <div className="p-1.5 rounded-md bg-white border border-[#E2E4E8]">
                  <p className="font-medium text-[#111111]">Декор, свет, сад -8%</p>
                  <p className="text-[10px] text-[#6E6E73]">от 50 руб. (кап 35 руб.)</p>
                </div>
                <div className="p-1.5 rounded-md bg-white border border-[#E2E4E8]">
                  <p className="font-medium text-[#111111]">Сезонный сток -10%</p>
                  <p className="text-[10px] text-[#6E6E73]">от 50 руб. (кап 40 руб.)</p>
                </div>
                <div className="p-1.5 rounded-md bg-white border border-[#E2E4E8]">
                  <p className="font-medium text-[#111111]">ОМА Мастер -10%</p>
                  <p className="text-[10px] text-[#6E6E73]">услуги от 60 руб. (кап 40 руб.)</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="w-full rounded-lg h-8 text-xs bg-[#ECEDF0] text-[#9A9BA1] font-medium cursor-not-allowed"
            >
              Накопите 10 баллов
            </button>
          </div>
        </div>
      </div>

      {/* 4. Активный купон (компактная плашка) */}
      {activeCoupons.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-[#E2E4E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-xs text-[#005DD6] bg-[#F0F5FD] px-2.5 py-1 rounded-md border border-[#E2E4E8]">
              {activeCoupons[0].code}
            </span>
            <div className="text-xs">
              <span className="font-bold text-[#111111] mr-1.5">
                {activeCoupons[0].title}
              </span>
              <span className="text-[#6E6E73]">
                · скидка {activeCoupons[0].discount} (до {activeCoupons[0].maxDiscountCap} руб.)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCopyCoupon(activeCoupons[0].code)}
            className="px-3 h-7.5 rounded-lg border border-[#E2E4E8] bg-white hover:bg-[#F8F9FA] text-[#111111] font-medium text-xs transition-colors cursor-pointer shrink-0"
          >
            {copiedCoupon === activeCoupons[0].code ? 'Скопировано' : 'Копировать код'}
          </button>
        </div>
      )}

      {/* 5. Задания месяца (компактный список 4 заданий) */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E4E8] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#111111]">
            Задания месяца (по 1 баллу за каждое, максимум 4 б./мес.)
          </h3>
          <span className="text-xs font-medium text-[#6E6E73]">
            Выполнено {completedCount} из 4
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-lg border flex items-center justify-between gap-2.5 ${
                task.completed ? 'bg-[#F8F9FA] border-[#E2E4E8]' : 'bg-white border-[#E2E4E8]'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#111111] truncate">
                    {task.title}
                  </span>
                  <span className="text-[10px] text-[#6E6E73] bg-[#ECEDF0] px-1.5 py-0.2 rounded shrink-0">
                    +1 б.
                  </span>
                </div>
                <p className="text-[11px] text-[#6E6E73] mt-0.5 truncate">
                  {task.conditionBasic}
                </p>
              </div>

              <div className="shrink-0">
                {task.completed ? (
                  <span className="text-[11px] text-[#2D8B5D] font-medium flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Готово
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (task.actionView === 'catalog') {
                        onGoToCatalog();
                      } else {
                        handleCompleteTask(task.id);
                      }
                    }}
                    className="h-7 px-3 rounded-md text-[11px] bg-[#005DD6] hover:bg-[#0048A8] text-white font-medium transition-colors cursor-pointer"
                  >
                    В каталог
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Краткие правила без лишней воды */}
      <div className="p-4 rounded-xl bg-white border border-[#E2E4E8] text-xs text-[#6E6E73] space-y-1.5">
        <p>
          • <strong>Кэшбэк (рубли):</strong> начисляем 4% со всех товаров. Списывайте в корзине до 20% суммы чека. Срок действия — 6 месяцев.
        </p>
        <p>
          • <strong>Баллы (задания):</strong> начисляются только за задания месяца (1 балл за задание). Баллы открывают лесенку скидок (3, 6, 10 б.). Срок купона — 30 дней.
        </p>
      </div>
    </div>
  );
};
