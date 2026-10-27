import React, { useState } from 'react';
import { Magnifier, CircleCheck, ArrowRight, Wrench } from '@gravity-ui/icons';
import { Button } from '@gravity-ui/uikit';
import { Product, Task } from '../types';
import productsData from '../data/products.json';
import tasksData from '../data/tasks.json';
import { ProductCard } from './ProductCard';

const products = productsData as Product[];
const tasks = tasksData as Task[];

interface HomePageProps {
  onSelectProduct: (product: Product) => void;
  onSelectTask: (task: Task) => void;
  onGoToCatalog: () => void;
  onSearchTask: (query: string) => void;
}

const TASK_ILLUSTRATIONS: Record<string, { bg: string; iconBg: string }> = {
  'zamenit-smesitel': { bg: 'bg-[#EDF4FF]', iconBg: 'bg-[#005DD6]' },
  'pokrasit-komnatu': { bg: 'bg-[#FEF6EE]', iconBg: 'bg-[#BD5C0A]' },
  'povesit-svetilnik': { bg: 'bg-[#F4F4F6]', iconBg: 'bg-[#111111]' },
  'ulozhit-laminat': { bg: 'bg-[#F0FDF4]', iconBg: 'bg-[#2D8B5D]' },
  'sobrat-mebel': { bg: 'bg-[#FDF4FF]', iconBg: 'bg-[#7C3AED]' },
  'obnovit-vannuyu': { bg: 'bg-[#EDF4FF]', iconBg: 'bg-[#005DD6]' },
};

export const HomePage: React.FC<HomePageProps> = ({
  onSelectProduct,
  onSelectTask,
  onGoToCatalog,
  onSearchTask,
}) => {
  const [taskQuery, setTaskQuery] = useState('');

  const popularProducts = React.useMemo(() => {
    // 8 популярных товаров
    return products.slice(0, 8);
  }, []);

  const handleTaskSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskQuery.trim()) {
      onSearchTask(taskQuery);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. Вступление — Figma node 51011:68791 */}
      <div className="space-y-2">
        <h1 className="text-[32px] md:text-[40px] font-medium leading-[48px] text-[#111111]">
          Дом начинается с OMA
        </h1>
        <p className="text-[17px] leading-[24px] text-[#6E6E73]">
          Строительные материалы, инструмент и сертифицированные мастера для любых задач ремонта.
        </p>
      </div>

      {/* 2. Подбор по задаче — Figma node 51011:68794 */}
      <div className="bg-white p-5 rounded-[24px] border border-[#E2E4E8] space-y-4 shadow-sm">
        <form onSubmit={handleTaskSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#9A9BA1]">
              <Magnifier />
            </div>
            <input
              type="text"
              value={taskQuery}
              onChange={(e) => setTaskQuery(e.target.value)}
              placeholder="Какую задачу нужно решить? Например, заменить смеситель или покрасить комнату…"
              className="w-full h-[52px] bg-white border border-[#E2E4E8] rounded-[12px] pl-11 pr-4 text-[15px] leading-[20px] text-[#111111] placeholder:text-[#6E6E73] outline-none focus:border-[#005DD6] transition-colors"
            />
          </div>

          <Button
            type="submit"
            view="action"
            size="l"
            className="!h-[52px] !rounded-[12px] !px-8 !bg-[#005DD6] hover:!bg-[#004EB8] !text-white !text-[15px] !font-normal shrink-0"
          >
            Подобрать решение
          </Button>
        </form>

        {/* Чипы готовых сценариев */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] text-[#6E6E73]">Популярные сценарии:</span>
          {tasks.slice(0, 4).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTask(t)}
              className="h-[28px] px-3 rounded-full bg-[#F4F4F6] hover:bg-[#EDF4FF] text-[#111111] hover:text-[#005DD6] text-[13px] font-normal transition-colors cursor-pointer border border-[#E2E4E8]"
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Готовые задачи (сетка 3x2) — Figma node 51011:68927 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-medium leading-[28px] text-[#111111]">
            Готовые задачи под ключ
          </h2>
          <span className="text-[13px] text-[#6E6E73]">Материалы + мастер в одном заказе</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const style = TASK_ILLUSTRATIONS[task.id] || { bg: 'bg-[#EDF4FF]', iconBg: 'bg-[#005DD6]' };
            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="bg-white rounded-[24px] p-5 border border-[#E2E4E8] hover:border-[#005DD6] transition-all duration-200 cursor-pointer group shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Иллюстрация задачи — Figma node 51011:68930 */}
                  <div className={`h-[136px] rounded-[16px] ${style.bg} relative p-4 flex flex-col justify-between overflow-hidden group-hover:scale-[1.01] transition-transform`}>
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-[10px] ${style.iconBg} text-white flex items-center justify-center shadow-xs`}>
                        <Wrench />
                      </div>
                      <span className="bg-white/90 backdrop-blur-xs text-[#111111] text-[11px] font-medium px-2 py-0.5 rounded-full shadow-xs">
                        С установкой
                      </span>
                    </div>

                    <p className="text-[13px] text-[#111111] font-medium">
                      Готовый набор с расчётом
                    </p>
                  </div>

                  <h3 className="text-[17px] font-medium leading-[24px] text-[#111111] mt-4 group-hover:text-[#005DD6] transition-colors">
                    {task.title}
                  </h3>

                  <p className="text-[13px] leading-[18px] text-[#6E6E73] mt-2 line-clamp-2">
                    {task.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E4E8] flex items-center justify-between text-[13px]">
                  <span className="text-[#005DD6] font-medium">Собрать комплект</span>
                  <ArrowRight className="text-[#005DD6] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Преимущества (3 панели) — Figma node 51011:68954 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-[#E2E4E8] space-y-3 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-[#EDF4FF] text-[#005DD6] flex items-center justify-center">
            <CircleCheck />
          </div>
          <h3 className="text-[17px] font-medium text-[#111111]">
            Гарантия 12 месяцев
          </h3>
          <p className="text-[13px] leading-[18px] text-[#6E6E73]">
            Официальный договор и страхование качества работ мастеров сервиса «ОМА Мастер».
          </p>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-[#E2E4E8] space-y-3 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-[#EDF4FF] text-[#005DD6] flex items-center justify-center">
            <CircleCheck />
          </div>
          <h3 className="text-[17px] font-medium text-[#111111]">
            Проверенные специалисты
          </h3>
          <p className="text-[13px] leading-[18px] text-[#6E6E73]">
            Все мастера проходят аттестацию, имеют средний подтверждённый рейтинг 4.8+ и опыт от 5 лет.
          </p>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-[#E2E4E8] space-y-3 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-[#EDF4FF] text-[#005DD6] flex items-center justify-center">
            <CircleCheck />
          </div>
          <h3 className="text-[17px] font-medium text-[#111111]">
            Единая корзина
          </h3>
          <p className="text-[13px] leading-[18px] text-[#6E6E73]">
            Товары, расходники и вызов мастера оформляются и оплачиваются в один понятный заказ.
          </p>
        </div>
      </div>

      {/* 5. Популярный каталог (сетка 4x2) — Figma node 51011:68976 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-medium leading-[28px] text-[#111111]">
            Популярные товары
          </h2>
          <button
            type="button"
            onClick={onGoToCatalog}
            className="text-[15px] text-[#005DD6] hover:underline font-medium cursor-pointer"
          >
            Смотреть все →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
