import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { UserProfile, ActiveCoupon } from '../types';
import { WELCOME_BONUSES_REGISTRATION } from '../config/loyalty';
import { syncUserProfile } from '../lib/supermemory';

interface UserContextType {
  user: UserProfile;
  setCity: (city: string) => void;
  addBonuses: (amount: number) => void;
  spendBonuses: (amount: number) => void;
  setActivityPoints: (points: number) => void;
  addActivityPoints: (points: number) => void;
  addActiveCoupon: (coupon: ActiveCoupon) => void;
  applyCoupon: (couponCode: string | null) => boolean;
  isRegistered: boolean;
  registerUser: (phone: string, name: string) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const defaultUser: UserProfile = {
  id: 'u_demo_1',
  name: 'Александр',
  phone: '+375 (29) 123-45-67',
  bonusBalance: 14.80,
  activityPoints: 6,
  aov: 45,
  activeCoupons: [
    {
      id: 'coupon_starter',
      code: 'RENT-30-START',
      title: 'Скидка 30% на сутки проката инструмента',
      discount: '30%',
      expiresInDays: 24,
      maxDiscountCap: 15,
      activatedAt: '24 октября 2026',
    },
  ],
  appliedCoupon: null,
  cardType: 'balans',
  level: 'master_home',
  city: 'Минск',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('oma_dom_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        const bonusBalance = (parsed.bonusBalance === 47 || !parsed.bonusBalance) ? 14.80 : parsed.bonusBalance;
        return {
          ...defaultUser,
          ...parsed,
          bonusBalance,
          activityPoints: parsed.activityPoints ?? 6,
          aov: parsed.aov ?? 45,
          activeCoupons: parsed.activeCoupons?.length ? parsed.activeCoupons : defaultUser.activeCoupons,
          appliedCoupon: parsed.appliedCoupon ?? null,
        };
      }
      return defaultUser;
    } catch {
      return defaultUser;
    }
  });

  const [isRegistered, setIsRegistered] = useState(true);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('oma_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('oma_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  }, [favorites]);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  useEffect(() => {
    try {
      localStorage.setItem('oma_dom_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user', e);
    }
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void syncUserProfile(user);
    }, 900);

    return () => window.clearTimeout(timer);
    // Only identity/profile data is synced; bonus balance is local.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.name, user.city, user.level, user.cardType, user.phone]);

  const setCity = (city: string) => {
    setUser((prev) => ({ ...prev, city }));
  };

  const addBonuses = (amount: number) => {
    setUser((prev) => ({ ...prev, bonusBalance: prev.bonusBalance + amount }));
  };

  const spendBonuses = (amount: number) => {
    setUser((prev) => ({ ...prev, bonusBalance: Math.max(0, prev.bonusBalance - amount) }));
  };

  const setActivityPoints = (points: number) => {
    setUser((prev) => ({ ...prev, activityPoints: Math.max(0, points) }));
  };

  const addActivityPoints = (points: number) => {
    setUser((prev) => ({ ...prev, activityPoints: (prev.activityPoints ?? 0) + points }));
  };

  const addActiveCoupon = (coupon: ActiveCoupon) => {
    setUser((prev) => {
      const existing = prev.activeCoupons || [];
      if (existing.some((c) => c.code === coupon.code)) return prev;
      return {
        ...prev,
        activeCoupons: [coupon, ...existing],
      };
    });
  };

  const applyCoupon = (code: string | null): boolean => {
    if (!code) {
      setUser((prev) => ({ ...prev, appliedCoupon: null }));
      return true;
    }
    const clean = code.trim().toUpperCase();
    const found = (user.activeCoupons || []).find((c) => c.code.toUpperCase() === clean);
    if (found) {
      setUser((prev) => ({ ...prev, appliedCoupon: found }));
      return true;
    }
    if (clean === 'RENT-30-START') {
      const c: ActiveCoupon = {
        id: 'c_rent',
        code: 'RENT-30-START',
        title: 'Скидка 30% на сутки проката инструмента',
        discount: '30%',
        expiresInDays: 30,
        maxDiscountCap: 15,
        activatedAt: 'Сегодня',
      };
      setUser((prev) => ({ ...prev, appliedCoupon: c, activeCoupons: [c, ...(prev.activeCoupons || [])] }));
      return true;
    }
    if (clean === 'LOGIST-30-OMA') {
      const c: ActiveCoupon = {
        id: 'c_logist',
        code: 'LOGIST-30-OMA',
        title: 'Скидка 30% на платную доставку или подъём',
        discount: '30%',
        expiresInDays: 30,
        minSpend: 100,
        maxDiscountCap: 20,
        activatedAt: 'Сегодня',
      };
      setUser((prev) => ({ ...prev, appliedCoupon: c, activeCoupons: [c, ...(prev.activeCoupons || [])] }));
      return true;
    }
    if (clean === 'REPAIR-5-MID') {
      const c: ActiveCoupon = {
        id: 'c_repair',
        code: 'REPAIR-5-MID',
        title: 'Скидка 5% на товары для монтажа и ремонта',
        discount: '5%',
        expiresInDays: 30,
        minSpend: 60,
        maxDiscountCap: 20,
        activatedAt: 'Сегодня',
      };
      setUser((prev) => ({ ...prev, appliedCoupon: c, activeCoupons: [c, ...(prev.activeCoupons || [])] }));
      return true;
    }
    if (clean === 'MASTER-10-PRO') {
      const c: ActiveCoupon = {
        id: 'c_master',
        code: 'MASTER-10-PRO',
        title: 'Купон 10% на услуги сервиса «ОМА Мастер»',
        discount: '10%',
        expiresInDays: 30,
        minSpend: 60,
        maxDiscountCap: 40,
        activatedAt: 'Сегодня',
      };
      setUser((prev) => ({ ...prev, appliedCoupon: c, activeCoupons: [c, ...(prev.activeCoupons || [])] }));
      return true;
    }
    return false;
  };

  const registerUser = (phone: string, name: string) => {
    setUser((prev) => ({
      ...prev,
      phone,
      name,
      bonusBalance: prev.bonusBalance + WELCOME_BONUSES_REGISTRATION,
    }));
    setIsRegistered(true);
  };

  const value = useMemo(
    () => ({
      user,
      setCity,
      addBonuses,
      spendBonuses,
      setActivityPoints,
      addActivityPoints,
      addActiveCoupon,
      applyCoupon,
      isRegistered,
      registerUser,
      favorites,
      toggleFavorite,
      isFavorite,
    }),
    [user, isRegistered, favorites]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
