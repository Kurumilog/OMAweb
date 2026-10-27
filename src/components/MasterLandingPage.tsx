import React, { useState } from 'react';
import { Button, TextInput, Dialog } from '@gravity-ui/uikit';
import {
  Magnifier,
  Wrench,
  Check,
  CircleCheck,
  ShieldCheck,
  Clock,
  ArrowRight,
} from '@gravity-ui/icons';
import servicesData from '../data/services.json';
import { Service } from '../types';

const allServices = servicesData as Service[];

interface MasterLandingPageProps {
  onSelectService: (service: Service) => void;
  onOpenOrderCabinet: () => void;
  onStartApplication: (service?: Service) => void;
}

const SERVICE_CATEGORIES = [
  { id: 'santekhnika', name: 'Сантехника', count: '24 услуг', icon: '💧' },
  { id: 'elektrika', name: 'Электрика', count: '18 услуг', icon: '⚡' },
  { id: 'mebel', name: 'Сборка мебели', count: '16 услуг', icon: '🪑' },
  { id: 'otdelka', name: 'Отделка', count: '21 услуг', icon: '🎨' },
  { id: 'dveri', name: 'Двери и окна', count: '12 услуг', icon: '🚪' },
  { id: 'tekhnika', name: 'Бытовая техника', count: '9 услуг', icon: '🔌' },
  { id: 'sanuzel', name: 'Санузел', count: '14 услуг', icon: '🛁' },
  { id: 'prochee', name: 'Прочее', count: '8 услуг', icon: '🔨' },
];

export const MasterLandingPage: React.FC<MasterLandingPageProps> = ({
  onSelectService,
  onOpenOrderCabinet,
  onStartApplication,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);

  const popularServices = [
    {
      id: 'svc_faucet_install',
      title: 'Установка смесителя',
      price: 25,
      duration: '1–3 дня',
      warranty: '12 месяцев',
    },
    {
      id: 'svc_light_install',
      title: 'Установка светильника',
      price: 35,
      duration: '1–3 дня',
      warranty: '12 месяцев',
    },
    {
      id: 'svc_closet_assembly',
      title: 'Сборка шкафа',
      price: 45,
      duration: '1–3 дня',
      warranty: '12 месяцев',
    },
    {
      id: 'svc_laminate_install',
      title: 'Укладка ламината',
      price: 60,
      duration: '1–3 дня',
      warranty: '12 месяцев',
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    const found = allServices.find(
      (s) => s.title.toLowerCase().includes(query) || s.id.includes(query)
    );
    if (found) {
      onSelectService(found);
    } else if (allServices[0]) {
      onSelectService(allServices[0]);
    }
  };

  const handleQuickChip = (term: string) => {
    setSearchQuery(term);
    const found = allServices.find((s) => s.title.toLowerCase().includes(term.toLowerCase()));
    if (found) {
      onSelectService(found);
    } else if (allServices[0]) {
      onSelectService(allServices[0]);
    }
  };

  const handleOrderService = (item: (typeof popularServices)[0]) => {
    const fullService = allServices.find((s) => s.id === item.id) || {
      id: item.id,
      title: item.title,
      type: 'fixed' as const,
      price: item.price,
      duration: item.duration,
      includes: ['Демонтаж старого', 'Монтаж нового', 'Проверка работы'],
      excludes: ['Материалы и трубы оплачиваются отдельно'],
      warrantyMonths: 12,
      bonusRate: 0.03,
    };
    onSelectService(fullService);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Header Intro (Figma 51011:74768) */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-oma-text-secondary">
          OMA МАСТЕР
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-oma-text leading-tight">
          Мастер по фиксированной цене
        </h1>
        <p className="text-base sm:text-lg text-oma-text-secondary max-w-2xl">
          Проверенные мастера для ремонта и домашних задач. Стоимость известна заранее, гарантия —
          12 месяцев.
        </p>
      </div>

      {/* 2. Search Panel (Figma 51011:74772) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <TextInput
              value={searchQuery}
              onUpdate={(val) => setSearchQuery(val)}
              placeholder="Что нужно сделать? Например, заменить смеситель"
              size="xl"
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            view="action"
            size="xl"
            className="!h-[52px] !rounded-xl !px-8 !font-semibold !text-base"
          >
            Найти услугу
          </Button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-oma-text-secondary">Популярно:</span>
          {['Заменить смеситель', 'Повесить люстру', 'Собрать шкаф', 'Уложить ламинат'].map(
            (term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleQuickChip(term)}
                className="px-3 py-1.5 rounded-full bg-[#ecedf0] hover:bg-oma-tint hover:text-oma-blue text-xs font-medium text-oma-text transition-colors cursor-pointer"
              >
                {term}
              </button>
            )
          )}
        </div>
      </div>

      {/* 3. Active Order Banner (Figma 51011:74929) */}
      <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="inline-flex items-center text-xs font-semibold text-oma-blue bg-oma-tint px-2.5 py-0.5 rounded-full">
            Активный заказ
          </span>
          <h3 className="text-xl font-bold text-oma-text">Мастер в пути, 13–18</h3>
          <p className="text-sm text-oma-text-secondary">
            Алексей · Установка смесителя · № OMA-10294
          </p>
        </div>
        <Button
          view="normal"
          size="l"
          className="!h-[52px] !rounded-xl !px-6 !font-semibold self-start sm:self-auto"
          onClick={onOpenOrderCabinet}
        >
          Открыть заказ
        </Button>
      </div>

      {/* 4. Service Categories Grid (8 categories) (Figma 51011:74979) */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-oma-text">Что нужно сделать?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                const target =
                  allServices.find((s) => s.id.includes(cat.id)) || allServices[0];
                onSelectService(target);
              }}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-oma-border shadow-sm hover:border-oma-blue hover:shadow-md transition-all cursor-pointer group space-y-2"
            >
              <div className="text-2xl">{cat.icon}</div>
              <h3 className="text-base font-semibold text-oma-text group-hover:text-oma-blue transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-oma-text-secondary">{cat.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Popular Services (4 Cards) (Figma 51011:75005) */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-oma-text">Популярные услуги</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <h3 className="text-base font-bold text-oma-text">{svc.title}</h3>
                <div className="text-2xl font-extrabold text-oma-text">{svc.price} руб.</div>
                <p className="text-xs text-oma-text-secondary">
                  {svc.duration} · Гарантия {svc.warranty}
                </p>
              </div>

              <Button
                view="normal"
                size="l"
                width="max"
                className="!h-[52px] !rounded-xl !font-semibold hover:!bg-oma-blue hover:!text-white transition-colors"
                onClick={() => handleOrderService(svc)}
              >
                Заказать
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Process Steps ("Как это работает", Figma 51011:75103) */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-oma-text">Как это работает</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: 1, title: 'Выберите услугу', desc: 'На сайте или добавьте к товару из каталога ОМА' },
            { step: 2, title: 'Укажите адрес и время', desc: 'Удобное 4-часовое окно визита мастера' },
            { step: 3, title: 'Встретьте мастера', desc: 'Специалист приедет с инструментом вовремя' },
            { step: 4, title: 'Примите работу', desc: 'Проверьте результат, получите гарантию и бонусы' },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-3"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-oma-tint text-oma-blue font-bold text-sm">
                {item.step}
              </span>
              <h3 className="text-base font-bold text-oma-text">{item.title}</h3>
              <p className="text-xs text-oma-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Advantages (Figma 51011:75209) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-2">
          <CircleCheck className="w-5 h-5 text-oma-blue" />
          <h3 className="text-base font-bold text-oma-text">Всё в одной корзине</h3>
          <p className="text-xs text-oma-text-secondary leading-relaxed">
            Товары, доставка и установка — вместе в едином чеке гипермаркета ОМА.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-2">
          <CircleCheck className="w-5 h-5 text-oma-blue" />
          <h3 className="text-base font-bold text-oma-text">Мастер по фиксированной цене</h3>
          <p className="text-xs text-oma-text-secondary leading-relaxed">
            Стоимость известна до начала работ и не меняется без предварительного согласия.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-2">
          <CircleCheck className="w-5 h-5 text-oma-blue" />
          <h3 className="text-base font-bold text-oma-text">Бонусы за услуги</h3>
          <p className="text-xs text-oma-text-secondary leading-relaxed">
            Копите и тратьте с программой «Баланс» до 20% от стоимости чека.
          </p>
        </div>
      </div>

      {/* 8. Partner Banner ("Станьте мастером OMA", Figma 51011:75231) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <h3 className="text-xl sm:text-2xl font-bold text-oma-text">Станьте мастером OMA</h3>
          <p className="text-sm text-oma-text-secondary leading-relaxed">
            Получайте заказы рядом с домом. Прозрачные условия, стабильный поток клиентов и
            поддержка на каждом этапе.
          </p>
        </div>
        <Button
          view="normal"
          size="l"
          className="!h-[52px] !rounded-xl !px-6 !font-semibold self-start sm:self-auto shrink-0"
          onClick={() => setPartnerDialogOpen(true)}
        >
          Оставить заявку
        </Button>
      </div>

      {/* Partner Registration Dialog */}
      <Dialog
        open={partnerDialogOpen}
        onOpenChange={setPartnerDialogOpen}
        hasCloseButton
      >
        <Dialog.Header caption="Заявка для мастеров" />
        <Dialog.Body>
          {partnerSubmitted ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-oma-tint text-oma-blue flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-oma-text">Спасибо за отклик!</h3>
              <p className="text-xs text-oma-text-secondary">
                Куратор сервиса «ОМА Мастер» свяжется с вами в течение рабочего дня.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-oma-text-secondary">
                Заполните контактные данные для регистрации в сервисе «ОМА Мастер».
              </p>
              <TextInput placeholder="Ваше имя" size="l" className="w-full" />
              <TextInput placeholder="Номер телефона" size="l" className="w-full" />
              <TextInput placeholder="Специализация (сантехника, электрика...)" size="l" className="w-full" />
              <Button
                view="action"
                size="l"
                width="max"
                className="!rounded-xl !font-semibold mt-2"
                onClick={() => setPartnerSubmitted(true)}
              >
                Отправить заявку
              </Button>
            </div>
          )}
        </Dialog.Body>
      </Dialog>
    </div>
  );
};
