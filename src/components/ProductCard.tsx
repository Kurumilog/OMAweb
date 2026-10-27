import React from 'react';
import { Star, StarFill } from '@gravity-ui/icons';
import { Button } from '@gravity-ui/uikit';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
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
  const [isFavorite, setIsFavorite] = React.useState(false);

  const cartItem = items.find((item) => item.product.id === product.id);
  const inCartCount = cartItem ? cartItem.quantity : 0;

  // Рассчитываем скидку, бонусы и стоимость установки
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

  const installPrice = relatedService ? relatedService.price : null;

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
    setIsFavorite(!isFavorite);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-[20px] p-4 border border-[#E2E4E8] flex flex-col justify-between hover:border-[#005DD6] transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
    >
      <div className="flex flex-col gap-3">
        {/* Медиа-блок 208 px — Figma node 51011:71002 */}
        <div className="relative h-[208px] rounded-[16px] bg-[#F4F4F6] overflow-hidden flex items-center justify-center">
          <img
            src={product.image || '/logo_cropped.png'}
            alt={product.name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Лейбл скидки */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-[#111111] text-white text-[13px] font-medium leading-[18px] px-2.5 py-0.5 rounded-full inline-block">
                −{discountPercent}%
              </span>
            </div>
          )}

          {/* Кнопка избранного */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#111111] hover:text-[#005DD6] transition-colors cursor-pointer shadow-xs"
            title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            {isFavorite ? (
              <StarFill className="text-[#005DD6]" />
            ) : (
              <Star className="text-[#9A9BA1] hover:text-[#005DD6]" />
            )}
          </button>

          {/* Чип наличия установки */}
          {relatedService && (
            <div className="absolute bottom-2 left-2 z-10">
              <span className="bg-[#EDF4FF] text-[#005DD6] text-[13px] font-medium leading-[18px] px-2.5 py-0.5 rounded-full inline-block">
                Установка
              </span>
            </div>
          )}
        </div>

        {/* Бренд и артикул */}
        <p className="text-[11px] leading-[16px] text-[#6E6E73] truncate">
          {product.brand || 'ОМА'} · Арт. {product.sku || product.id}
        </p>

        {/* Название товара */}
        <h3 className="text-[15px] leading-[20px] font-normal text-[#111111] min-h-[40px] line-clamp-2 group-hover:text-[#005DD6] transition-colors">
          {product.name}
        </h3>

        {/* Цена */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-[24px] font-medium leading-[28px] text-[#111111]">
            {product.price.toFixed(2)}
          </span>
          <span className="text-[13px] leading-[18px] text-[#111111]">руб.</span>
        </div>

        {/* Скидка и бонусы */}
        <div className="flex items-center gap-3 text-[13px] leading-[18px]">
          {hasDiscount && (
            <span className="text-[#9A9BA1] line-through">
              {product.oldPrice!.toFixed(2)} руб.
            </span>
          )}
          <span className="text-[#005DD6] font-medium">
            +{bonusPoints} Б
          </span>
        </div>

        {/* Чип установки с ценой */}
        {installPrice ? (
          <div className="inline-flex items-center">
            <span className="bg-[#ECEDF0] text-[#6E6E73] text-[13px] leading-[18px] px-2.5 py-0.5 rounded-full">
              + Установка от {installPrice} руб.
            </span>
          </div>
        ) : (
          <div className="h-[22px]" />
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {/* Кнопка действия (52 px) — Gravity Button */}
        <Button
          type="button"
          view={inCartCount > 0 ? 'action' : 'normal'}
          size="l"
          width="max"
          onClick={handleAddToCart}
          className={`!h-[52px] !rounded-[12px] !text-[15px] !font-normal transition-colors ${
            inCartCount > 0
              ? '!bg-[#005DD6] hover:!bg-[#004EB8] !text-white'
              : '!bg-[#ECEDF0] hover:!bg-[#E2E4E8] !text-[#111111]'
          }`}
        >
          {inCartCount > 0 ? `В корзине · ${inCartCount}` : 'В корзину'}
        </Button>

        {/* Статус наличия */}
        <p className="text-[13px] leading-[18px] text-[#2D8B5D]">
          В наличии · {relatedService ? 'Установка доступна' : 'Доставка завтра'}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
