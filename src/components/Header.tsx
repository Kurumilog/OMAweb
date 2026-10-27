import React, { useState } from 'react';
import {
  MapPin,
  ChevronDown,
  Magnifier,
  Heart,
  ShoppingCart,
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
      <div className="h-[84px] bg-white border-b border-[#E2E4E8]">
        <div className="max-w-[1440px] h-full mx-auto px-4 md:px-10 flex items-center gap-4 md:gap-6">
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
              className="h-[38px] md:h-[44px] w-auto object-contain"
            />
          </button>

          {/* Поиск (растягивается, занимает всё доступное пространство) */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0 flex items-center gap-2">
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
              className="!h-[52px] !rounded-[12px] !px-5 md:!px-6 !bg-[#ECEDF0] hover:!bg-[#E2E4E8] !text-[#111111] !text-[15px] !font-normal shrink-0"
            >
              Найти
            </Button>
          </form>

          {/* Правый блок: аккаунт, избранное, корзина — компактная группа с аккуратным расстоянием */}
          <div className="flex items-center gap-4 md:gap-5 shrink-0">
            {/* Профиль и бонусы — Figma node 51011:68589 */}
            <button
              type="button"
              onClick={onOpenLoyalty || onOpenProfile}
              title="Программа лояльности «Баланс»"
              className="flex flex-col text-left shrink-0 cursor-pointer group min-w-[70px] md:min-w-[85px]"
            >
              <span className="text-[14px] md:text-[15px] leading-[18px] md:leading-[20px] text-[#111111] group-hover:text-[#005DD6] transition-colors font-normal truncate">
                {user.name || 'Александр'}
              </span>
              <span className="text-[12px] md:text-[13px] leading-[16px] md:leading-[18px] text-[#005DD6] font-medium">
                {formatPoints(user.bonusBalance)}
              </span>
            </button>

            {/* Избранное (просто значок) — Figma node 51011:68592 */}
            <button
              type="button"
              onClick={() => alert('Раздел «Избранное»')}
              className="w-[32px] h-[32px] flex items-center justify-center text-[#005DD6] hover:scale-110 transition-transform cursor-pointer shrink-0"
              title="Избранное"
            >
              <Heart className="w-[24px] h-[24px] md:w-[26px] md:h-[26px]" />
            </button>

            {/* Корзина (значок + количество) — Figma node 51011:68598 */}
            <button
              type="button"
              onClick={handleCartClick}
              className="flex items-center gap-1.5 text-[#005DD6] hover:scale-105 transition-transform cursor-pointer shrink-0"
              title={`Корзина · ${totalCartCount}`}
            >
              <ShoppingCart className="w-[24px] h-[24px] md:w-[26px] md:h-[26px]" />
              <span className="text-[13px] md:text-[14px] font-normal leading-[18px] text-[#111111]">
                {totalCartCount}
              </span>
            </button>
          </div>
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
