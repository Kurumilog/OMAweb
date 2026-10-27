import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { UserProfile } from '../types';
import { WELCOME_BONUSES_REGISTRATION } from '../config/loyalty';
import { syncUserProfile } from '../lib/supermemory';

interface UserContextType {
  user: UserProfile;
  setCity: (city: string) => void;
  addBonuses: (amount: number) => void;
  spendBonuses: (amount: number) => void;
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
  bonusBalance: 47,
  cardType: 'balans',
  level: 'novice',
  city: 'Минск',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('oma_dom_user');
      return saved ? JSON.parse(saved) : defaultUser;
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
