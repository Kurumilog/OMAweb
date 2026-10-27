import React, { useState } from 'react';
import {
  MapPin,
  Search,
  ShoppingCart,
  User,
  Heart,
  ChevronDown,
  Wrench,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { formatPoints } from '../config/loyalty';

interface HeaderProps {
  onSearch: (query: string) => void;
  onGoHome: () => void;
  activeView: 'catalog' | 'master' | 'product';
  onOpenMaster: () => void;
  onOpenProfile?: () => void;
}

const CITIES = ['Минск', 'Брест', 'Гродно', 'Гомель', 'Витебск', 'Могилев', 'Барановичи', 'Бобруйск'];

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onGoHome,
  activeView,
  onOpenMaster,
  onOpenProfile,
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

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-oma-border">
      {/* 1. Minimalist Top Service Bar */}
      <div className="bg-oma-bg/70 border-b border-oma-border/70 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between text-oma-text-secondary">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setCityModalOpen(true)}
              className="flex items-center space-x-1 hover:text-oma-text transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-oma-blue" />
              <span>Выбрано:</span>
              <span className="font-semibold text-oma-blue">{user.city}</span>
              <ChevronDown className="w-3 h-3 text-oma-text-tertiary" />
            </button>
            <button
              onClick={onGoHome}
              className={`hover:text-oma-text transition-colors cursor-pointer ${
                activeView === 'catalog' ? 'font-semibold text-oma-text' : ''
              }`}
            >
              Каталог товаров
            </button>
            <button
              onClick={onOpenMaster}
              className={`flex items-center space-x-1 hover:text-oma-blue transition-colors cursor-pointer ${
                activeView === 'master' ? 'font-bold text-oma-blue' : 'font-medium text-oma-text'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-oma-blue" />
              <span>ОМА Мастер</span>
            </button>
            <a href="#delivery" className="hover:text-oma-text transition-colors">
              Доставка и самовывоз
            </a>
            <a href="#loyalty" className="hover:text-oma-text transition-colors">
              Программа «Баланс»
            </a>
          </div>

          <div className="flex items-center space-x-5">
            <a href="#b2b" className="hover:text-oma-text transition-colors">
              Партнерам / B2B
            </a>
            <span className="text-oma-text-tertiary text-[11px]">Демо-концепт ОМА Дом</span>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <div className="max-w-[1360px] mx-auto px-4 py-3.5 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Official Logo from logo_opengraph.png */}
        <button
          onClick={onGoHome}
          className="flex items-center shrink-0 cursor-pointer focus:outline-none group"
          title="На главную ОМА"
        >
          <img
            src="/logo_cropped.png"
            alt="ОМА"
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </button>

        {/* Center: Properly Sized Yandex-style Search Input + Fitted Button */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl">
          <div className="h-11 flex items-stretch bg-oma-surface-alt rounded-xl border border-oma-border/70 overflow-hidden focus-within:border-oma-blue focus-within:bg-white transition-colors">
            <Search className="w-4 h-4 text-oma-text-tertiary ml-3.5 shrink-0 self-center pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Найти товары в каталоге ОМА..."
              className="flex-1 h-full bg-transparent text-oma-text text-sm px-3 outline-none placeholder:text-oma-text-secondary min-w-0"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => {
                  setSearchValue('');
                  onSearch('');
                }}
                className="self-center p-1.5 mr-1 text-oma-text-tertiary hover:text-oma-text cursor-pointer shrink-0"
                aria-label="Очистить поиск"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="h-full px-5 bg-oma-blue hover:bg-oma-blue-hover text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center justify-center"
            >
              Найти
            </button>
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
          {/* Quick OMA Master Button */}
          <button
            type="button"
            onClick={onOpenMaster}
            className={`hidden lg:flex items-center space-x-2 h-11 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'master'
                ? 'bg-oma-blue text-white'
                : 'bg-oma-blue-tint text-oma-blue hover:bg-oma-blue hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>ОМА Мастер</span>
          </button>

          {/* Profile / Bonuses */}
          <button
            type="button"
            onClick={onOpenProfile}
            title="Профиль"
            className="hidden sm:flex items-center space-x-2.5 h-11 px-3.5 rounded-xl bg-oma-surface-alt hover:bg-oma-border/70 transition-colors cursor-pointer text-left"
          >
            <User className="w-4 h-4 text-oma-text" />
            <div className="leading-tight">
              <div className="text-xs font-semibold text-oma-text">{user.name}</div>
              <div className="text-[11px] font-medium text-oma-blue">
                {formatPoints(user.bonusBalance)}
              </div>
            </div>
          </button>

          {/* Favorites */}
          <button
            type="button"
            className="hidden xl:flex items-center space-x-1.5 h-11 px-3.5 rounded-xl bg-oma-surface-alt hover:bg-oma-border/70 text-oma-text text-xs font-medium transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4 text-oma-text" />
            <span>Избранное</span>
          </button>

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center space-x-2 h-11 bg-oma-surface-alt hover:bg-oma-border/80 text-oma-text font-semibold px-4 rounded-xl transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-oma-blue" />
            <span className="text-xs sm:text-sm">
              {grandTotal > 0 ? `${grandTotal.toFixed(2)} руб.` : 'Корзина'}
            </span>
            {totalCartCount > 0 && (
              <span className="bg-oma-blue text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* City Selector Modal */}
      {cityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-oma-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-oma-text">Выберите ваш город</h3>
              <button
                onClick={() => setCityModalOpen(false)}
                className="text-oma-text-tertiary hover:text-oma-text p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-oma-text-secondary mb-4">
              Наличие товаров и доступность мастеров зависят от выбранного города.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCity(c);
                    setCityModalOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-xs rounded-xl text-left font-medium transition-colors cursor-pointer ${
                    user.city === c
                      ? 'bg-oma-blue text-white font-semibold'
                      : 'bg-oma-surface-alt hover:bg-oma-border text-oma-text'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
