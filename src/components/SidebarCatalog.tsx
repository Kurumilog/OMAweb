import React from 'react';
import {
  LayoutGrid,
  PaintRoller,
  BrickWall,
  Wrench,
  Droplets,
  Lightbulb,
  Hammer,
  Armchair,
  Home,
  Settings,
  Trees,
  ChevronRight,
} from 'lucide-react';

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
    installServiceTitle: 'Прокат профессионального инструмента ОМА',
    installPriceInfo: 'от 18.00 руб. / сутки',
    installDetails:
      'Скидка 20% на прокат для держателей карты «Баланс». Перфораторы, шуруповерты, лазерные уровни.',
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

interface SidebarCatalogProps {
  selectedCategory: string;
  activeView: 'catalog' | 'master' | 'product';
  onSelectCategory: (categoryId: string) => void;
  onOpenMaster?: () => void;
}

export const SidebarCatalog: React.FC<SidebarCatalogProps> = ({
  selectedCategory,
  activeView,
  onSelectCategory,
}) => {
  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-3">
      {/* Catalog Categories Card */}
      <div className="bg-white rounded-2xl border border-oma-border shadow-card overflow-hidden sticky top-20">
        {/* Sidebar Header */}
        <div className="bg-oma-surface-alt text-oma-text px-4 py-3.5 flex items-center space-x-2.5 border-b border-oma-border">
          <LayoutGrid className="w-4 h-4 text-oma-blue shrink-0" />
          <span className="font-bold text-xs uppercase tracking-wider">Весь каталог</span>
        </div>

        {/* Desktop Vertical List */}
        <nav className="hidden lg:flex flex-col divide-y divide-oma-border/60">
          {CATALOG_CATEGORIES.map((cat) => {
            const isActive = activeView === 'catalog' && selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors cursor-pointer group ${
                  isActive
                    ? 'bg-oma-blue-tint text-oma-blue font-semibold'
                    : 'bg-white hover:bg-oma-bg text-oma-text font-normal'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-oma-blue' : 'text-oma-text-secondary group-hover:text-oma-blue'
                    }`}
                  >
                    {cat.icon}
                  </span>
                  <span className="text-[13px] truncate">{cat.title}</span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isActive
                      ? 'text-oma-blue translate-x-0.5'
                      : 'text-oma-text-tertiary opacity-0 group-hover:opacity-100'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Mobile Horizontal Pills */}
        <div className="lg:hidden flex items-center space-x-2 overflow-x-auto p-2.5 bg-white">
          {CATALOG_CATEGORIES.map((cat) => {
            const isActive = activeView === 'catalog' && selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-oma-blue text-white font-semibold'
                    : 'bg-oma-surface-alt text-oma-text hover:bg-oma-border'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
