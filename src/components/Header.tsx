import React, { useState } from 'react';
import {
  MapPin,
  ChevronDown,
  Magnifier,
  Heart,
  HeartFill,
  ShoppingCart,
  Xmark,
  TrashBin,
} from '@gravity-ui/icons';
import { Button, Dialog, Drawer } from '@gravity-ui/uikit';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { formatPoints, formatBYN } from '../config/loyalty';
import { SHUFFLED_PRODUCTS } from '../utils/catalog';
import { Product } from '../types';

const allProducts = SHUFFLED_PRODUCTS;

interface HeaderProps {
  onSearch: (query: string) => void;
  onGoHome: () => void;
  onGoCatalog: () => void;
  activeView: string;
  onOpenMaster: () => void;
  onOpenProfile?: () => void;
  onOpenLoyalty?: () => void;
  onOpenCart?: () => void;
  onSelectProduct?: (product: Product) => void;
  onShowFavoritesInCatalog?: () => void;
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
  onSelectProduct,
  onShowFavoritesInCatalog,
}) => {
  const { items, setIsCartOpen, addToCart } = useCart();
  const { user, setCity, favorites, toggleFavorite } = useUser();
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const favoriteProducts = React.useMemo(
    () => allProducts.filter((p) => favorites.includes(p.id)),
    [favorites]
  );

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
      <div className="h-[36px] border-b border-[#E2E4E8] bg-white text-[12px] sm:text-[13px] leading-[18px] text-[#111111]">
        <div className="max-w-[1440px] h-full mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8 whitespace-nowrap shrink-0">
            {/* Город */}
            <button
              type="button"
              onClick={() => setCityModalOpen(true)}
              className="flex items-center space-x-1 sm:space-x-1.5 text-[#111111] hover:text-[#005DD6] transition-colors cursor-pointer"
            >
              <MapPin className="text-[#005DD6] shrink-0" />
              <span className="hidden sm:inline">Выбрано:</span>
              <span className="font-medium text-[#005DD6]">{user.city}</span>
              <ChevronDown className="text-[#9A9BA1] shrink-0" />
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
              className="hidden md:inline hover:text-[#005DD6] transition-colors text-[#111111]"
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
              Программа лояльности
            </button>
          </div>

          <div className="hidden lg:flex items-center space-x-6 shrink-0">
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

      {/* 2. Основная шапка (84 px на десктопе, адаптивная на мобильных) — Figma node 51011:68504 */}
      <div className="min-h-[72px] sm:h-[84px] py-2.5 sm:py-0 bg-white border-b border-[#E2E4E8]">
        <div className="max-w-[1440px] h-full mx-auto px-4 sm:px-6 lg:px-10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-5 md:gap-6">
          {/* Логотип ОМА (110x53 px) */}
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center shrink-0 cursor-pointer focus:outline-none order-1"
            title="ОМА — на главную"
          >
            <img
              src="/logo_cropped.png"
              alt="ОМА"
              className="h-[34px] sm:h-[40px] md:h-[44px] w-auto object-contain"
            />
          </button>

          {/* Поиск (растягивается, занимает всё доступное пространство) */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full sm:w-auto sm:flex-1 min-w-0 flex items-center gap-2 order-3 sm:order-2"
          >
            <div className="relative flex-1 h-[44px] sm:h-[52px]">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#9A9BA1]">
                <Magnifier />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Найти товары в каталоге OMA…"
                className="w-full h-[44px] sm:h-[52px] bg-white border border-[#E2E4E8] rounded-[12px] pl-10 pr-9 text-[14px] sm:text-[15px] leading-[20px] text-[#111111] placeholder:text-[#6E6E73] outline-none focus:border-[#005DD6] transition-colors"
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
              className="!h-[44px] sm:!h-[52px] !rounded-[12px] !px-4 sm:!px-6 !bg-[#ECEDF0] hover:!bg-[#E2E4E8] !text-[#111111] !text-[14px] sm:!text-[15px] !font-normal shrink-0"
            >
              Найти
            </Button>
          </form>

          {/* Правый блок: аккаунт, избранное, корзина — компактная группа с аккуратным расстоянием */}
          <div className="flex items-center gap-3.5 sm:gap-4 md:gap-5 shrink-0 order-2 sm:order-3">
            {/* Профиль и бонусы — Figma node 51011:68589 */}
            <button
              type="button"
              onClick={onOpenLoyalty || onOpenProfile}
              title="Программа лояльности"
              className="flex flex-col text-left shrink-0 cursor-pointer group min-w-[64px] md:min-w-[85px]"
            >
              <span className="text-[13px] sm:text-[14px] md:text-[15px] leading-[18px] md:leading-[20px] text-[#111111] group-hover:text-[#005DD6] transition-colors font-normal truncate">
                {user.name || 'Александр'}
              </span>
              <span className="text-[12px] md:text-[13px] leading-[16px] md:leading-[18px] text-[#005DD6] font-medium">
                {user.bonusBalance} руб. · {user.activityPoints ?? 6} б.
              </span>
            </button>

            {/* Избранное (значок + счётчик при наличии) — Figma node 51011:68592 */}
            <button
              type="button"
              onClick={() => setFavoritesOpen(true)}
              className="relative flex items-center gap-1.5 text-[#005DD6] hover:scale-105 transition-transform cursor-pointer shrink-0"
              title={`Избранное${favorites.length > 0 ? ` · ${favorites.length}` : ''}`}
            >
              {favorites.length > 0 ? (
                <HeartFill className="w-[24px] h-[24px] md:w-[26px] md:h-[26px] text-[#005DD6]" />
              ) : (
                <Heart className="w-[24px] h-[24px] md:w-[26px] md:h-[26px] text-[#005DD6]" />
              )}
              {favorites.length > 0 && (
                <span className="text-[13px] md:text-[14px] font-normal leading-[18px] text-[#111111]">
                  {favorites.length}
                </span>
              )}
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

      {/* Панель «Избранное» через Gravity Drawer */}
      <Drawer
        open={favoritesOpen}
        onOpenChange={setFavoritesOpen}
        placement="right"
        className="z-50"
      >
        <div className="w-screen sm:w-[420px] max-w-full bg-white flex flex-col h-full p-5 sm:p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E4E8]">
            <div>
              <h2 className="text-xl font-bold text-[#111111]">Избранное</h2>
              <p className="text-xs text-[#6E6E73] mt-0.5">
                {favoriteProducts.length > 0
                  ? `Сохранено ${favoriteProducts.length} ${
                      favoriteProducts.length === 1 ? 'товар' : favoriteProducts.length < 5 ? 'товара' : 'товаров'
                    }`
                  : 'Список избранных товаров'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFavoritesOpen(false)}
              className="w-8 h-8 rounded-full bg-[#F4F4F6] hover:bg-[#E2E4E8] flex items-center justify-center text-[#111111] cursor-pointer"
              title="Закрыть"
            >
              <Xmark className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 py-4 space-y-3 overflow-y-auto">
            {favoriteProducts.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#EDF4FF] text-[#005DD6] flex items-center justify-center mx-auto">
                  <Heart className="w-7 h-7" />
                </div>
                <p className="text-base font-medium text-[#111111]">В избранном пока пусто</p>
                <p className="text-xs text-[#6E6E73] max-w-xs mx-auto leading-relaxed">
                  Нажимайте на сердечко на карточках товаров или на странице товара, чтобы быстро находить нужные материалы и сантехнику.
                </p>
                <Button
                  view="action"
                  size="l"
                  onClick={() => {
                    setFavoritesOpen(false);
                    onGoCatalog();
                  }}
                  className="!rounded-[12px] !mt-2"
                >
                  Перейти в каталог
                </Button>
              </div>
            ) : (
              favoriteProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setFavoritesOpen(false);
                    if (onSelectProduct) onSelectProduct(p);
                  }}
                  className="bg-[#F4F4F6] hover:bg-[#EDF4FF]/60 border border-[#E2E4E8] rounded-2xl p-3 flex items-center gap-3.5 cursor-pointer transition-colors group"
                >
                  <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 border border-[#E2E4E8]">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[#6E6E73] uppercase truncate">
                      {p.brand} · {p.sku}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-[#111111] group-hover:text-[#005DD6] line-clamp-2 leading-snug mt-0.5">
                      {p.name}
                    </div>
                    <div className="text-sm font-bold text-[#111111] mt-1">
                      {formatBYN(p.price)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(p.id);
                      }}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-red-50 text-[#9A9BA1] hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="Удалить из избранного"
                    >
                      <TrashBin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p, 1);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#005DD6] hover:bg-[#004EB8] text-white text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      В корзину
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {favoriteProducts.length > 0 && (
            <div className="pt-4 border-t border-[#E2E4E8] flex flex-col gap-2">
              {onShowFavoritesInCatalog && (
                <Button
                  view="action"
                  size="l"
                  width="max"
                  onClick={() => {
                    setFavoritesOpen(false);
                    onShowFavoritesInCatalog();
                  }}
                  className="!h-[48px] !rounded-[12px]"
                >
                  Показать избранное в каталоге ({favoriteProducts.length})
                </Button>
              )}
            </div>
          )}
        </div>
      </Drawer>

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
