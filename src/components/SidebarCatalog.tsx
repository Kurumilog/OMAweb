import React from 'react';
import {
  LayoutGrid,
  Droplets,
  PaintRoller,
  BrickWall,
  Lightbulb,
  Wrench,
  Hammer,
  Armchair,
  Settings,
  Home,
  Trees,
  ChevronRight,
} from 'lucide-react';
import { Checkbox } from '@gravity-ui/uikit';

export interface CategoryMeta {
  id: string;
  title: string;
  description: string;
  installServiceTitle?: string;
  installPriceInfo?: string;
  installDetails?: string;
  icon: React.ReactNode;
}

export const CATALOG_CATEGORIES: CategoryMeta[] = [
  {
    id: 'all',
    title: 'Все товары',
    description: 'Весь ассортимент строительных и отделочных товаров ОМА',
    icon: <LayoutGrid className="w-4 h-4" />,
  },
  {
    id: 'santekhnika',
    title: 'Сантехника',
    description: 'Смесители, раковины, унитазы, ванны и душевые системы',
    installServiceTitle: 'Установка сантехники мастером ОМА',
    installPriceInfo: 'от 38.00 руб.',
    installDetails:
      'Ориентир стоимости: смеситель — от 38 руб., раковина — от 45 руб., унитаз — от 55 руб. Точная смета согласуется с мастером до начала работ.',
    icon: <Droplets className="w-4 h-4" />,
  },
  {
    id: 'otdelka',
    title: 'Интерьер и отделка',
    description: 'Краски, ламинат, обои, керамическая плитка и двери',
    installServiceTitle: 'Отделочные работы и укладка покрытий',
    installPriceInfo: 'от 12.00 руб. / м²',
    installDetails:
      'Укладка ламината — от 12 руб./м², покраска стен — от 10 руб./м², монтаж дверей — от 65 руб. Гарантия 12 месяцев.',
    icon: <PaintRoller className="w-4 h-4" />,
  },
  {
    id: 'stroymaterialy',
    title: 'Стройматериалы',
    description: 'Сухие смеси, грунтовки, герметики, гипсокартон и изоляция',
    installServiceTitle: 'Черновые и подготовительные работы',
    installPriceInfo: 'от 15.00 руб. / м²',
    installDetails:
      'Грунтовка, шпатлевка и монтаж гипсокартонных конструкций по согласованной смете.',
    icon: <BrickWall className="w-4 h-4" />,
  },
  {
    id: 'elektrika',
    title: 'Электрика',
    description: 'Светильники, люстры, розетки, выключатели и кабель',
    installServiceTitle: 'Услуги электрика ОМА',
    installPriceInfo: 'от 25.00 руб.',
    installDetails:
      'Навеска и подключение люстры — от 35 руб., замена/установка розетки или выключателя — от 25 руб. Гарантия 12 месяцев.',
    icon: <Lightbulb className="w-4 h-4" />,
  },
  {
    id: 'instrument',
    title: 'Инструмент',
    description: 'Электроинструмент, ручной и измерительный инструмент, оснастка',
    installServiceTitle: 'Обслуживание и настройка инструмента',
    installPriceInfo: 'от 15.00 руб.',
    installDetails:
      'Диагностика, проверка точности лазерных нивелиров и сервисное обслуживание электроинструмента.',
    icon: <Wrench className="w-4 h-4" />,
  },
  {
    id: 'krepezh',
    title: 'Крепеж',
    description: 'Дюбели, саморезы, анкеры и монтажные системы',
    installServiceTitle: 'Мелкий бытовой монтаж («Мастер на час»)',
    installPriceInfo: 'от 30.00 руб.',
    installDetails:
      'Навеска карнизов, полок, зеркал, кронштейнов ТВ с профессиональным крепежом ОМА.',
    icon: <Hammer className="w-4 h-4" />,
  },
  {
    id: 'mebel',
    title: 'Мебель и кухни',
    description: 'Кухонные мойки, гарнитуры, системы хранения и фурнитура',
    installServiceTitle: 'Сборка мебели и установка кухонь',
    installPriceInfo: 'от 40.00 руб.',
    installDetails:
      'Сборка шкафов, тумб, столов и монтаж кухонных гарнитуров под ключ с врезкой мойки.',
    icon: <Armchair className="w-4 h-4" />,
  },
  {
    id: 'inzhenernye',
    title: 'Инженерные системы',
    description: 'Водоснабжение, отопление, полотенцесушители и вентиляция',
    installServiceTitle: 'Монтаж инженерных коммуникаций',
    installPriceInfo: 'от 45.00 руб.',
    installDetails:
      'Установка полотенцесушителей, водонагревателей и фильтров очистки воды с гарантией 12 месяцев.',
    icon: <Settings className="w-4 h-4" />,
  },
  {
    id: 'dom',
    title: 'Товары для дома',
    description: 'Аксессуары для ванной, текстиль, хранение и уборка',
    installServiceTitle: 'Монтаж аксессуаров для ванной и дома',
    installPriceInfo: 'от 25.00 руб.',
    installDetails: 'Аккуратное сверление по плитке без сколов и установка аксессуаров.',
    icon: <Home className="w-4 h-4" />,
  },
  {
    id: 'sad',
    title: 'Благоустройство',
    description: 'Товары для дачи, участка, фасада и придомовой территории',
    installServiceTitle: 'Сезонные работы и сборка садовой техники',
    installPriceInfo: 'от 35.00 руб.',
    installDetails: 'Подготовка оборудования к сезону, сборка теплиц и садовой мебели.',
    icon: <Trees className="w-4 h-4" />,
  },
];

const POPULAR_BRANDS = ['WISENT', 'GROHE', 'Cersanit', 'Tarkett', 'Knauf', 'BOSCH'];

interface SidebarCatalogProps {
  selectedCategory: string;
  activeView: string;
  onSelectCategory: (categoryId: string) => void;
  onOpenMaster?: () => void;
  maxPrice?: number;
  onMaxPriceChange?: (price: number | undefined) => void;
  selectedBrands?: string[];
  onToggleBrand?: (brand: string) => void;
  onlyWithInstallation?: boolean;
  onToggleOnlyInstallation?: () => void;
}

export const SidebarCatalog: React.FC<SidebarCatalogProps> = ({
  selectedCategory,
  activeView,
  onSelectCategory,
  maxPrice,
  onMaxPriceChange,
  selectedBrands = [],
  onToggleBrand,
  onlyWithInstallation = false,
  onToggleOnlyInstallation,
}) => {
  return (
    <aside className="w-full lg:w-[290px] shrink-0 space-y-4">
      {/* 1. Карточка категорий каталога (290 px) — Figma node 51011:80300 */}
      <div className="bg-white rounded-[20px] border border-[#E2E4E8] p-4 shadow-sm">
        <div className="text-[13px] font-medium leading-[18px] text-[#6E6E73] mb-3 px-2">
          Категории каталога
        </div>

        {/* Вертикальный список 11 категорий */}
        <nav className="flex flex-col space-y-1">
          {CATALOG_CATEGORIES.map((cat) => {
            const isActive = activeView === 'catalog' && selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full h-[40px] px-3 rounded-[12px] text-left flex items-center justify-between transition-colors cursor-pointer group ${
                  isActive
                    ? 'bg-[#EDF4FF] text-[#005DD6] font-medium'
                    : 'bg-white hover:bg-[#F4F4F6] text-[#111111]'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span
                    className={`shrink-0 ${
                      isActive ? 'text-[#005DD6]' : 'text-[#6E6E73] group-hover:text-[#005DD6]'
                    }`}
                  >
                    {cat.icon}
                  </span>
                  <span className="text-[13px] truncate">{cat.title}</span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isActive
                      ? 'text-[#005DD6] translate-x-0.5'
                      : 'text-[#9A9BA1] opacity-0 group-hover:opacity-100'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* 2. Блок фильтрации (по макету 51011:80489) */}
        {onMaxPriceChange && (
          <div className="mt-6 pt-5 border-t border-[#E2E4E8] space-y-4">
            <h4 className="text-[17px] font-medium leading-[24px] text-[#111111] px-1">
              Фильтры
            </h4>

            {/* Фильтр цены */}
            <div className="space-y-1 px-1">
              <label className="text-[13px] text-[#6E6E73] block">
                Цена до, руб.
              </label>
              <input
                type="number"
                min="0"
                step="10"
                placeholder="до 300 руб."
                value={maxPrice || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onMaxPriceChange(isNaN(val) ? undefined : val);
                }}
                className="w-full h-[44px] px-3 bg-[#F4F4F6] border border-[#E2E4E8] rounded-[10px] text-[15px] text-[#111111] outline-none focus:border-[#005DD6]"
              />
            </div>

            {/* Бренды */}
            {onToggleBrand && (
              <div className="space-y-2 pt-2 px-1">
                <span className="text-[13px] font-medium text-[#111111] block mb-1">
                  Бренды
                </span>
                {POPULAR_BRANDS.map((brand) => (
                  <div key={brand} className="flex items-center">
                    <Checkbox
                      size="m"
                      checked={selectedBrands.includes(brand)}
                      onUpdate={() => onToggleBrand(brand)}
                    >
                      <span className="text-[13px] text-[#111111] ml-1">{brand}</span>
                    </Checkbox>
                  </div>
                ))}
              </div>
            )}

            {/* Чип «Можно установить» */}
            {onToggleOnlyInstallation && (
              <div className="pt-2 px-1">
                <button
                  type="button"
                  onClick={onToggleOnlyInstallation}
                  className={`w-full h-[36px] rounded-full text-[13px] font-medium transition-colors cursor-pointer border flex items-center justify-center gap-1.5 ${
                    onlyWithInstallation
                      ? 'bg-[#005DD6] text-white border-[#005DD6]'
                      : 'bg-[#EDF4FF] text-[#005DD6] border-[#EDF4FF] hover:bg-[#DCEAFF]'
                  }`}
                >
                  <span>✓ Можно установить</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarCatalog;
