import React from 'react';
import { Heart, HeartFill } from '@gravity-ui/icons';
import { Button } from '@gravity-ui/uikit';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { calculateBonusPoints } from '../config/loyalty';
import servicesData from '../data/services.json';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
}) => {
  const { items, addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useUser();
  const liked = isFavorite(product.id);

  const cartItem = items.find((item) => item.product.id === product.id);
  const inCartCount = cartItem ? cartItem.quantity : 0;

  // Рассчитываем скидку и бонусы
  const hasDiscount = Boolean(product.oldPrice && product.oldPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0;

  const bonusPoints = calculateBonusPoints(product.price);

  const relatedService = product.serviceId
    ? servicesData.find((s) => s.id === product.serviceId)
    : product.installable
    ? servicesData[0]
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product, 1);
    }
  };

  const handleCardClick = () => {
    onSelectProduct(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      data-name="Custom / Карточка товара"
      className="bg-white rounded-[20px] p-3.5 sm:p-[16px] border border-[#E2E4E8] flex flex-col gap-[10px] sm:gap-[12px] items-start hover:border-[#005DD6] transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
    >
      {/* 1. Медиа-блок 208 px — Figma node 51011:68982 */}
      <div className="relative h-[180px] sm:h-[208px] rounded-[16px] bg-[#F4F4F6] overflow-hidden flex items-center justify-center shrink-0 w-full">
        <img
          src={product.image || '/logo_cropped.png'}
          alt={product.name}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300 rounded-[16px]"
          loading="lazy"
        />

        {/* Метки: скидка слева вверху */}
        {hasDiscount && (
          <div className="absolute top-[8px] left-[8px] z-10">
            <span className="bg-[#111111] text-white text-[12px] sm:text-[13px] font-normal leading-[18px] px-[6px] py-[3px] rounded-full inline-block">
              −{discountPercent}%
            </span>
          </div>
        )}

        {/* Избранное справа вверху */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-pressed={liked}
          className={`absolute top-[8px] right-[7.5px] z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-90 ${
            liked
              ? 'bg-[#EDF4FF] text-[#005DD6] ring-1 ring-[#005DD6]/30'
              : 'bg-white/85 hover:bg-white text-[#111111] hover:text-[#005DD6]'
          }`}
          title={liked ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          {liked ? (
            <HeartFill className="w-4 h-4 text-[#005DD6]" />
          ) : (
            <Heart className="w-4 h-4 text-current" />
          )}
        </button>

        {/* Установка слева внизу */}
        {relatedService && (
          <div className="absolute bottom-[8px] left-[8px] z-10">
            <span className="bg-[#EDF4FF] text-[#005DD6] text-[13px] font-normal leading-[18px] px-[6px] py-[3px] rounded-full inline-block">
              Установка
            </span>
          </div>
        )}
      </div>

      {/* 2. Идентификатор (Бренд и артикул) — Figma node 51036:4309 */}
      <div className="flex items-center justify-between text-[11px] leading-[16px] text-[#6E6E73] font-normal uppercase w-full">
        <span className="truncate">{product.brand || 'OMA'}</span>
        <span className="truncate ml-2">{product.sku || product.id}</span>
      </div>

      {/* 3. Название товара — Figma node 51011:69040 */}
      <p className="text-[15px] leading-[20px] font-normal text-[#111111] min-h-[44px] line-clamp-2 w-full group-hover:text-[#005DD6] transition-colors">
        {product.name}
      </p>

      {/* 4. Цена — Figma node 51011:69041 */}
      <div className="flex items-baseline gap-[8px] text-[#111111] whitespace-nowrap">
        <span className="text-[24px] font-medium leading-[28px]">
          {product.price.toFixed(2)}
        </span>
        <span className="text-[13px] leading-[18px]">руб.</span>
      </div>

      {/* 5. Скидка и кэшбэк — Figma node 51011:69044 */}
      <div className="flex items-start gap-[12px] text-[13px] leading-[18px] whitespace-nowrap">
        {hasDiscount && (
          <span className="text-[#9A9BA1] line-through">
            {product.oldPrice!.toFixed(2)} руб.
          </span>
        )}
        <span className="text-[#005DD6] font-normal">
          4% кэшбэк
        </span>
      </div>

      {/* 6. Кнопка действия (52 px) — Figma node 51011:69071 */}
      <Button
        type="button"
        view={inCartCount > 0 ? 'action' : 'normal'}
        size="l"
        width="max"
        onClick={handleAddToCart}
        className={`!h-[52px] !rounded-[12px] !text-[15px] !font-normal transition-colors !w-full ${
          inCartCount > 0
            ? '!bg-[#005DD6] hover:!bg-[#004EB8] !text-white'
            : '!bg-[#ECEDF0] hover:!bg-[#E2E4E8] !text-[#111111]'
        }`}
      >
        {inCartCount > 0 ? `В корзине · ${inCartCount}` : 'В корзину'}
      </Button>
    </div>
  );
};

export default ProductCard;
