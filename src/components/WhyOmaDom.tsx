import React from 'react';
import { ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';

export const WhyOmaDom: React.FC = () => {
  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white rounded-2xl p-5 border border-oma-border shadow-card flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-oma-surface-alt flex items-center justify-center text-oma-blue shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-oma-text mb-1">Всё в одной корзине</h3>
            <p className="text-xs text-oma-text-secondary leading-relaxed">
              Товары, расходники, прокат инструмента и услуги мастера в едином заказе.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-oma-border shadow-card flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-oma-surface-alt flex items-center justify-center text-oma-blue shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-oma-text mb-1">Проверенные мастера</h3>
            <p className="text-xs text-oma-text-secondary leading-relaxed">
              Прозрачные условия, понятный перечень работ и официальная гарантия 12 месяцев.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-oma-border shadow-card flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-oma-surface-alt flex items-center justify-center text-oma-blue shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-oma-text mb-1">Бонусы за каждый шаг</h3>
            <p className="text-xs text-oma-text-secondary leading-relaxed">
              Начисляем 5% за товары и 3% за работу мастера на карту «Баланс».
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
