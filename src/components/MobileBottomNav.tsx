import React from 'react';
import { Home, LayoutGrid, Wrench, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { formatPoints } from '../config/loyalty';

interface MobileBottomNavProps {
  onGoHome: () => void;
  onScrollToCatalog: () => void;
  onOpenMaster?: () => void;
  onOpenProfile?: () => void;
  activeView?: 'catalog' | 'product' | 'master';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onGoHome,
  onScrollToCatalog,
  onOpenMaster,
  onOpenProfile,
  activeView = 'catalog',
}) => {
  const { items, setIsCartOpen } = useCart();
  const { user } = useUser();
  const totalCount = items.reduce(
    (sum, item) => sum + item.quantity + (item.installService ? 1 : 0),
    0
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-oma-border px-2 py-2 flex items-center justify-around text-[11px] text-oma-text-secondary">
      <button
        onClick={onGoHome}
        className={`flex flex-col items-center justify-center p-1 cursor-pointer ${
          activeView === 'catalog' ? 'text-oma-blue font-semibold' : 'font-medium'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="mt-0.5">Главная</span>
      </button>

      <button
        onClick={onScrollToCatalog}
        className="flex flex-col items-center justify-center p-1 hover:text-oma-text font-medium cursor-pointer"
      >
        <LayoutGrid className="w-5 h-5" />
        <span className="mt-0.5">Каталог</span>
      </button>

      <button
        onClick={onOpenMaster}
        className={`flex flex-col items-center justify-center p-1 cursor-pointer ${
          activeView === 'master' ? 'text-oma-blue font-semibold' : 'hover:text-oma-text font-medium'
        }`}
      >
        <Wrench className="w-5 h-5" />
        <span className="mt-0.5">Мастер</span>
      </button>

      <button
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center justify-center p-1 hover:text-oma-text relative font-medium cursor-pointer"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-oma-blue text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </div>
        <span className="mt-0.5">Корзина</span>
      </button>

      <button
        onClick={onOpenProfile}
        className="flex flex-col items-center justify-center p-1 font-medium cursor-pointer"
        title="Профиль"
      >
        <User className="w-5 h-5 text-oma-text" />
        <span className="mt-0.5 text-oma-blue font-semibold">{formatPoints(user.bonusBalance)}</span>
      </button>
    </div>
  );
};
