import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-oma-border mt-12 pt-10 pb-20 md:pb-10 px-4 text-xs text-oma-text-secondary">
      <div className="max-w-[1360px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-oma-border">
          <div>
            <div className="flex items-center mb-3">
              <img src="/logo_cropped.png" alt="ОМА" className="h-6 w-auto object-contain" />
            </div>
            <p className="text-xs text-oma-text-secondary leading-relaxed mb-4">
              Экосистема товаров и услуг ремонта: покупка стройматериалов, прокат инструмента и установка проверенными мастерами.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-oma-surface-alt text-[11px] font-medium text-oma-text">
              <ShieldCheck className="w-3.5 h-3.5 text-oma-blue" />
              <span>Гарантия 12 месяцев на работы</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs text-oma-text mb-3">Покупателям</h4>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-oma-text transition-colors">Услуги мастеров</a></li>
              <li><a href="#delivery" className="hover:text-oma-text transition-colors">Доставка и самовывоз</a></li>
              <li><a href="#loyalty" className="hover:text-oma-text transition-colors">Программа «Баланс»</a></li>
              <li><a href="#rental" className="hover:text-oma-text transition-colors">Прокат инструмента</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-oma-text mb-3">Готовые сценарии</h4>
            <ul className="space-y-2">
              <li><a href="#task-faucet" className="hover:text-oma-text transition-colors">Заменить смеситель</a></li>
              <li><a href="#task-paint" className="hover:text-oma-text transition-colors">Покрасить комнату</a></li>
              <li><a href="#task-lights" className="hover:text-oma-text transition-colors">Повесить светильник</a></li>
              <li><a href="#task-laminate" className="hover:text-oma-text transition-colors">Уложить ламинат</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-oma-text mb-3">Информация</h4>
            <p className="text-xs text-oma-text-secondary leading-relaxed mb-3">
              Демо-концепт для хакатона space в Минске.
            </p>
            <div className="p-3 bg-oma-bg rounded-xl border border-oma-border text-[11px] text-oma-text-secondary">
              Демо-концепт на данных ОМА. Не является официальным сайтом.
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-oma-text-tertiary">
          <div>© 2026 ОМА Дом — демо-версия для хакатона.</div>
          <a
            href="https://www.oma.by"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-oma-text flex items-center space-x-1"
          >
            <span>oma.by</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};
