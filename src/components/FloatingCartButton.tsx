import React from 'react';
import { ShoppingCart, Wrench, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatBYN } from '../config/loyalty';

interface FloatingCartButtonProps {
  onGoToMaster?: () => void;
  onOpenCart?: () => void;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onGoToMaster, onOpenCart }) => {
  const { items, isCartOpen, setIsCartOpen, grandTotal, servicesTotal } = useCart();

  if (items.length === 0 || isCartOpen) return null;

  const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0);
  const installCount = items.filter((item) => Boolean(item.installService)).length;

  const handleClick = () => {
    if (onOpenCart) {
      onOpenCart();
    } else {
      setIsCartOpen(true);
    }
  };

  return (
    <div className="fixed bottom-18 md:bottom-6 right-4 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <button
        onClick={handleClick}
        className="group bg-oma-text hover:bg-oma-blue text-white rounded-2xl p-3.5 sm:px-5 sm:py-3.5 shadow-xl border border-white/10 flex items-center space-x-3.5 transition-all cursor-pointer"
      >
        <div className="relative w-10 h-10 rounded-xl bg-oma-blue group-hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
          <ShoppingCart className="w-5 h-5 text-white" />
          <span className="absolute -top-1.5 -right-1.5 bg-white text-oma-text text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
            {totalProducts}
          </span>
        </div>

        <div className="text-left pr-1">
          <div className="flex items-center space-x-1.5 text-xs text-white/80">
            <span>В корзине {totalProducts} тов.</span>
            {installCount > 0 && (
              <span className="inline-flex items-center space-x-1 bg-white/15 text-white px-1.5 py-0.2 rounded-md text-[10px] font-medium">
                <Wrench className="w-2.5 h-2.5" />
                <span>+{installCount} уст.</span>
              </span>
            )}
          </div>
          <div className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
            {servicesTotal > 0 ? `от ${formatBYN(grandTotal)}` : formatBYN(grandTotal)}
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />

        {onGoToMaster && (
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onGoToMaster();
            }}
            className="hidden sm:inline-flex items-center space-x-1 bg-white/15 hover:bg-white/25 px-2 py-1 rounded-lg text-[10px] font-semibold text-white shrink-0"
          >
            <Wrench className="w-3 h-3" />
            <span>Мастер</span>
          </span>
        )}
      </button>
    </div>
  );
};
