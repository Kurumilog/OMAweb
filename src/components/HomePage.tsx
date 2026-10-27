import React, { useState } from 'react';
import { Magnifier } from '@gravity-ui/icons';
import { Button } from '@gravity-ui/uikit';
import { Product, Task } from '../types';
import { SHUFFLED_PRODUCTS } from '../utils/catalog';
import tasksData from '../data/tasks.json';
import { ProductCard } from './ProductCard';

const products = SHUFFLED_PRODUCTS;
const tasks = tasksData as Task[];

interface HomePageProps {
  onSelectProduct: (product: Product) => void;
  onSelectTask: (task: Task) => void;
  onGoToCatalog: () => void;
  onSearchTask: (query: string) => void;
}

interface HomeTaskDef {
  id: string;
  nodeId: string;
  title: string;
  priceText: string;
  image: string;
  taskDataId: string;
}

const SIX_TASKS: HomeTaskDef[] = [
  {
    id: 'paint_room',
    nodeId: '51011:68929',
    title: 'Покрасить комнату',
    priceText: 'от 60 руб. с установкой',
    image: '/tasks/paint_room.png',
    taskDataId: 'pokrasit-komnatu',
  },
  {
    id: 'replace_faucet',
    nodeId: '51011:68933',
    title: 'Заменить смеситель',
    priceText: 'от 130.79 руб. с установкой',
    image: '/tasks/replace_faucet.png',
    taskDataId: 'zamenit-smesitel',
  },
  {
    id: 'lighting_sockets',
    nodeId: '51011:68937',
    title: 'Повесить светильник / розетки',
    priceText: 'от 35 руб. с установкой',
    image: '/tasks/lighting_sockets.png',
    taskDataId: 'povesit-svetilnik',
  },
  {
    id: 'laminate',
    nodeId: '51011:68942',
    title: 'Уложить ламинат',
    priceText: 'от 60 руб. с установкой',
    image: '/tasks/laminate.png',
    taskDataId: 'ulozhit-laminat',
  },
  {
    id: 'furniture_kitchen',
    nodeId: '51011:68946',
    title: 'Собрать мебель или кухню',
    priceText: 'от 45 руб. с установкой',
    image: '/tasks/furniture_kitchen.png',
    taskDataId: 'sobrat-mebel',
  },
  {
    id: 'bathroom_renovation',
    nodeId: '51011:68950',
    title: 'Обновить ванную',
    priceText: 'от 60 руб. с установкой',
    image: '/tasks/bathroom_renovation.png',
    taskDataId: 'obnovit-vannuyu',
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  onSelectProduct,
  onSelectTask,
  onGoToCatalog,
  onSearchTask,
}) => {
  const [taskQuery, setTaskQuery] = useState('');

  const popularProducts = React.useMemo(() => {
    return products.slice(0, 8);
  }, []);

  const handleTaskSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskQuery.trim()) {
      onSearchTask(taskQuery);
    }
  };

  const handleSelectTaskById = (taskDataId: string) => {
    const found = tasks.find((t) => t.id === taskDataId);
    if (found) {
      onSelectTask(found);
    } else {
      // Fallback
      onSelectTask(tasks[0]);
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

        {/* Чипы подсказок */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] text-[#6E6E73]">Популярные сценарии:</span>
          {SIX_TASKS.slice(0, 3).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTaskById(item.taskDataId)}
              className="h-[28px] px-3 rounded-full bg-[#F4F4F6] hover:bg-[#EDF4FF] text-[#111111] hover:text-[#005DD6] text-[13px] font-normal transition-colors cursor-pointer border border-[#E2E4E8]"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Готовые задачи (все шесть компонентов точь-в-точь как в Figma) — Figma node 51011:68927 */}
      <div className="space-y-4" data-node-id="51011:68927" data-name="Готовые задачи">
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-medium leading-[28px] text-[#111111]">
            Готовые задачи
          </h2>
          <span className="text-[13px] text-[#6E6E73]">Материалы + мастер в одном заказе</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SIX_TASKS.map((taskItem) => (
            <div
              key={taskItem.id}
              onClick={() => handleSelectTaskById(taskItem.taskDataId)}
              data-node-id={taskItem.nodeId}
              data-name="Custom / Карточка задачи"
              className="bg-white flex flex-col gap-[12px] items-start p-[20px] rounded-[24px] cursor-pointer border border-[#E2E4E8] hover:border-[#005DD6] hover:shadow-md transition-all duration-200 group"
            >
              <div
                className="h-[136px] relative rounded-[16px] shrink-0 w-full overflow-hidden"
                data-name="Иллюстрация задачи"
              >
                <img
                  alt={taskItem.title}
                  className="absolute inset-0 object-cover rounded-[16px] size-full group-hover:scale-105 transition-transform duration-300"
                  src={taskItem.image}
                  loading="lazy"
                />
              </div>

              <p className="font-medium text-[17px] leading-[24px] text-[#111111] w-full group-hover:text-[#005DD6] transition-colors">
                {taskItem.title}
              </p>

              <p className="font-normal text-[15px] leading-[20px] text-[#6E6E73] w-full">
                {taskItem.priceText}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Популярный каталог (сетка 4x2 с компактными карточками) — Figma node 51011:68979 */}
      <div className="space-y-4" data-node-id="51011:68979" data-name="Товары">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
