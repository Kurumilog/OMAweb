import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Service, CartItem } from '../types';
import servicesData from '../data/services.json';
import { BONUS_RATE_GOODS, BONUS_RATE_SERVICE, MAX_BONUS_PAY_SHARE } from '../config/loyalty';

const servicesList = servicesData as Service[];

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, withInstallation?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleInstallation: (productId: string, customService?: Service) => void;
  replaceProductInCart: (oldProductId: string, newProduct: Product) => void;
  addBundle: (bundleProducts: { product: Product; qty: number; withInstallation?: boolean }[]) => void;
  clearCart: () => void;
  goodsTotal: number;
  servicesTotal: number;
  grandTotal: number;
  bonusesEarned: number;
  bonusesToSpend: number;
  setBonusesToSpend: (amount: number) => void;
  maxBonusesAllowed: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('oma_dom_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bonusesToSpend, setBonusesToSpend] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('oma_dom_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1, withInstallation = false) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const service =
        withInstallation && product.serviceId
          ? servicesList.find((s) => s.id === product.serviceId) || servicesList[0]
          : withInstallation
          ? servicesList[0]
          : null;

      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? {
                ...i,
                quantity: i.quantity + quantity,
                installService: withInstallation ? service || i.installService : i.installService,
              }
            : i
        );
      }

      return [...prev, { product, quantity, installService: service }];
    });
    // Note: Do NOT open cart automatically; floating button at bottom-right handles it
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const toggleInstallation = (productId: string, customService?: Service) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.product.id !== productId) return i;
        if (i.installService) {
          return { ...i, installService: null };
        }
        const service =
          customService ||
          (i.product.serviceId
            ? servicesList.find((s) => s.id === i.product.serviceId) || servicesList[0]
            : servicesList[0]);
        return { ...i, installService: service };
      })
    );
  };

  const replaceProductInCart = (oldProductId: string, newProduct: Product) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.product.id !== oldProductId) return i;
        const service =
          i.installService && newProduct.serviceId
            ? servicesList.find((s) => s.id === newProduct.serviceId) || i.installService
            : i.installService;
        return {
          product: newProduct,
          quantity: i.quantity,
          installService: service,
        };
      })
    );
  };

  const addBundle = (
    bundleProducts: { product: Product; qty: number; withInstallation?: boolean }[]
  ) => {
    setItems((prev) => {
      const next = [...prev];
      for (const item of bundleProducts) {
        const idx = next.findIndex((p) => p.product.id === item.product.id);
        const service =
          item.withInstallation && item.product.serviceId
            ? servicesList.find((s) => s.id === item.product.serviceId) || null
            : null;

        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            quantity: next[idx].quantity + item.qty,
            installService: service || next[idx].installService,
          };
        } else {
          next.push({
            product: item.product,
            quantity: item.qty,
            installService: service,
          });
        }
      }
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    setBonusesToSpend(0);
  };

  const goodsTotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const servicesTotal = items.reduce(
    (sum, i) => sum + (i.installService ? i.installService.price * i.quantity : 0),
    0
  );

  const rawTotal = goodsTotal + servicesTotal;
  const maxBonusesAllowed = Math.floor(rawTotal * MAX_BONUS_PAY_SHARE);
  const effectiveBonuses = Math.min(bonusesToSpend, maxBonusesAllowed);
  const grandTotal = Math.max(0, rawTotal - effectiveBonuses);

  const bonusesEarned = Math.round(
    goodsTotal * BONUS_RATE_GOODS + servicesTotal * BONUS_RATE_SERVICE
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleInstallation,
        replaceProductInCart,
        addBundle,
        clearCart,
        goodsTotal,
        servicesTotal,
        grandTotal,
        bonusesEarned,
        bonusesToSpend: effectiveBonuses,
        setBonusesToSpend,
        maxBonusesAllowed,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
