import React, { useState } from 'react';
import {
  MapPin,
  ChevronDown,
  Magnifier,
  Star,
  Xmark,
  Wrench,
} from '@gravity-ui/icons';
import { Button, Dialog } from '@gravity-ui/uikit';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { formatPoints } from '../config/loyalty';

interface HeaderProps {
  onSearch: (query: string) => void;
  onGoHome: () => void;
  onGoCatalog: () => void;
  activeView: string;
  onOpenMaster: () => void;
  onOpenProfile?: () => void;
  onOpenLoyalty?: () => void;
  onOpenCart?: () => void;
}

const CITIES = ['Минск', 'Брест', 'Гродно', 'Гомель', 'Витебск', 'Могилев', 'Барановичи', 'Бобруйск'];

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onGoHome,
  onGoCatalog,
  activeView,
  onOpenMaster,
  onOpenProfile,
  onOpenLoyalty,
  onOpenCart,
}) => {
  const { items, setIsCartOpen, grandTotal } = useCart();
  const { user, setCity } = useUser();
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    onSearch(val);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleCartClick = () => {
    if (onOpenCart) {
      onOpenCart();
    } else {
      setIsCartOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E4E8] w-full">
      {/* 1. Верхняя полоса навигации (36 px) — Figma node 51011:68491 */}
      <div className="h-[36px] border-b border-[#E2E4E8] bg-white text-[13px] leading-[18px] text-[#111111]">
        <div className="max-w-[1440px] h-full mx-auto px-10 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Город */}
            <button
              type="button"
              onClick={() => setCityModalOpen(true)}
              className="flex items-center space-x-1.5 text-[#111111] hover:text-[#005DD6] transition-colors cursor-pointer"
            >
              <MapPin className="text-[#005DD6]" />
              <span>Выбрано:</span>
              <span className="font-medium text-[#005DD6]">{user.city}</span>
              <ChevronDown className="text-[#9A9BA1]" />
            </button>

            {/* Каталог */}
            <button
              type="button"
              onClick={onGoCatalog}
              className={`hover:text-[#005DD6] transition-colors cursor-pointer ${
                activeView === 'catalog' ? 'font-medium text-[#005DD6]' : 'text-[#111111]'
              }`}
            >
              Каталог товаров
            </button>

            {/* OMA Мастер */}
            <button
              type="button"
              onClick={onOpenMaster}
              className={`hover:text-[#005DD6] transition-colors cursor-pointer ${
                activeView === 'master' ? 'font-semibold text-[#005DD6]' : 'text-[#111111]'
              }`}
            >
              OMA Мастер
            </button>

            <a
              href="#delivery"
              onClick={(e) => {
                e.preventDefault();
                alert('Доставка по всей Беларуси и бесплатный самовывоз из гипермаркетов ОМА.');
              }}
              className="hover:text-[#005DD6] transition-colors text-[#111111]"
            >
              Доставка и самовывоз
            </a>

            <button
              type="button"
              onClick={onOpenLoyalty || onOpenProfile}
              className={`hover:text-[#005DD6] transition-colors cursor-pointer ${
                activeView === 'loyalty' ? 'font-semibold text-[#005DD6]' : 'text-[#111111]'
              }`}
            >
              Программа «Баланс»
            </button>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="#b2b"
              onClick={(e) => {
                e.preventDefault();
                alert('Корпоративный отдел ОМА: b2b@oma.by · +375 (17) 330-33-33');
              }}
              className="hover:text-[#005DD6] transition-colors text-[#6E6E73]"
            >
              Партнерам / B2B
            </a>
          </div>
        </div>
      </div>

      {/* 2. Основная шапка (84 px) — Figma node 51011:68504 */}
      <div className="h-[84px] bg-white">
        <div className="max-w-[1440px] h-full mx-auto px-10 flex items-center justify-between gap-5">
          {/* Логотип ОМА (110x53 px) */}
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center shrink-0 cursor-pointer focus:outline-none"
            title="ОМА — на главную"
          >
            <img
              src="/logo_cropped.png"
              alt="ОМА"
              className="h-[44px] w-auto object-contain"
            />
          </button>

          {/* Поиск (высота 52 px) */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-[770px] flex items-center gap-2">
            <div className="relative flex-1 h-[52px]">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#9A9BA1]">
                <Magnifier />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Найти товары в каталоге OMA…"
                className="w-full h-[52px] bg-white border border-[#E2E4E8] rounded-[12px] pl-10 pr-10 text-[15px] leading-[20px] text-[#111111] placeholder:text-[#6E6E73] outline-none focus:border-[#005DD6] transition-colors"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue('');
                    onSearch('');
                  }}
                  className="absolute inset-y-0 right-3 flex items-center text-[#9A9BA1] hover:text-[#111111] cursor-pointer"
                  title="Очистить"
                >
                  <Xmark />
                </button>
              )}
            </div>

            <Button
              type="submit"
              view="normal"
              size="l"
              className="!h-[52px] !rounded-[12px] !px-6 !bg-[#ECEDF0] hover:!bg-[#E2E4E8] !text-[#111111] !text-[15px] !font-normal"
            >
              Найти
            </Button>
          </form>

          {/* Чип «OMA Мастер» (высота 28 px) — Figma node 51011:68565 */}
          <button
            type="button"
            onClick={onOpenMaster}
            className="h-[28px] px-3 rounded-full bg-[#EDF4FF] text-[#005DD6] hover:bg-[#005DD6] hover:text-white transition-colors text-[13px] font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Wrench />
            <span>OMA Мастер</span>
          </button>

          {/* Профиль и бонусы — Figma node 51011:68589 */}
          <button
            type="button"
            onClick={onOpenLoyalty || onOpenProfile}
            title="Программа лояльности «Баланс»"
            className="flex flex-col text-left shrink-0 cursor-pointer group"
          >
            <span className="text-[15px] leading-[20px] text-[#111111] group-hover:text-[#005DD6] transition-colors">
              {user.name || 'Александр'}
            </span>
            <span className="text-[13px] leading-[18px] text-[#005DD6] font-medium">
              {formatPoints(user.bonusBalance)}
            </span>
          </button>

          {/* Избранное — Figma node 51011:68592 */}
          <button
            type="button"
            onClick={() => alert('Раздел «Избранное»')}
            className="flex flex-col items-center justify-center shrink-0 text-[#111111] hover:text-[#005DD6] transition-colors cursor-pointer group"
          >
            <Star className="text-[#111111] group-hover:text-[#005DD6] transition-colors" />
            <span className="text-[13px] leading-[18px]">Избранное</span>
          </button>

          {/* Корзина — Figma node 51011:68598 */}
          <button
            type="button"
            onClick={handleCartClick}
            className="flex items-center text-[13px] leading-[18px] font-medium text-[#111111] hover:text-[#005DD6] transition-colors cursor-pointer shrink-0 bg-[#F4F4F6] hover:bg-[#ECEDF0] px-3.5 py-2 rounded-[12px]"
          >
            <span>Корзина · {totalCartCount}</span>
            {grandTotal > 0 && (
              <span className="ml-1.5 text-[#005DD6] font-semibold">
                ({grandTotal.toFixed(2)} руб.)
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Модальное окно выбора города через Gravity Dialog */}
      <Dialog open={cityModalOpen} onOpenChange={setCityModalOpen} hasCloseButton>
        <Dialog.Header caption="Выберите ваш город" />
        <Dialog.Body>
          <p className="text-[13px] text-[#6E6E73] mb-4">
            Наличие товаров, условия доставки и свободные слоты мастеров «ОМА Мастер» рассчитываются для выбранного города.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCity(c);
                  setCityModalOpen(false);
                }}
                className={`px-3.5 py-2.5 text-[13px] rounded-[12px] text-left transition-colors cursor-pointer ${
                  user.city === c
                    ? 'bg-[#005DD6] text-white font-medium'
                    : 'bg-[#ECEDF0] hover:bg-[#E2E4E8] text-[#111111]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Dialog.Body>
      </Dialog>
    </header>
  );
};

export default Header;
