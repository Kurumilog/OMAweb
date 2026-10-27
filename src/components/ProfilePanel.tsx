import React from 'react';
import { X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { formatPoints } from '../config/loyalty';

interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
}

const cardLabels: Record<string, string> = {
  balans: 'Баланс',
  custom: 'Выбираем сами',
};

const levelLabels: Record<string, string> = {
  novice: 'Новичок',
  master_home: 'Мастер дома',
  expert: 'Эксперт',
};

const Row: React.FC<{ label: string; value: string; accent?: boolean }> = ({
  label,
  value,
  accent,
}) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-xs text-oma-text-secondary">{label}</span>
    <span className={`text-xs font-medium ${accent ? 'text-oma-blue' : 'text-oma-text'}`}>
      {value}
    </span>
  </div>
);

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ open, onClose }) => {
  const { user } = useUser();

  if (!open) return null;

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm border border-oma-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-oma-border">
          <h2 className="text-base font-semibold text-oma-text">Профиль</h2>
          <button
            onClick={onClose}
            className="p-1 -mr-1 text-oma-text-secondary hover:text-oma-text transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center space-x-3 pb-5 border-b border-oma-border">
            <div className="w-12 h-12 rounded-full bg-oma-surface-alt flex items-center justify-center text-sm font-semibold text-oma-text shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-oma-text truncate">{user.name}</div>
              <div className="text-xs text-oma-text-secondary mt-0.5">{user.phone}</div>
            </div>
          </div>

          <div className="divide-y divide-oma-border">
            <Row label="Город" value={user.city} />
            <Row label="Карта лояльности" value={cardLabels[user.cardType] ?? user.cardType} />
            <Row label="Уровень" value={levelLabels[user.level] ?? user.level} />
            <Row label="Бонусы" value={formatPoints(user.bonusBalance)} accent />
          </div>
        </div>
      </div>
    </div>
  );
};
