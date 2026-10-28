import React, { useState, useMemo, useRef } from 'react';
import { Button, TextInput, Dialog } from '@gravity-ui/uikit';
import {
  Magnifier,
  Check,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  GeoPin,
} from '@gravity-ui/icons';
import servicesData from '../data/services.json';
import { Service, ServiceCategoryId } from '../types';
import { formatBYN } from '../config/loyalty';

const allServices = servicesData as Service[];

interface MasterLandingPageProps {
  onSelectService: (service: Service) => void;
  onOpenOrderCabinet: () => void;
  onStartApplication: (service?: Service) => void;
  hasActiveOrder?: boolean;
  activeOrderSummary?: {
    orderNumber: string;
    serviceTitle: string;
    masterName: string;
    dateTime: string;
    statusLabel: string;
  };
}

interface ServiceCategoryCard {
  id: ServiceCategoryId;
  nodeId: string;
  name: string;
  count: string;
  image: string;
}

const SERVICE_CATEGORIES: ServiceCategoryCard[] = [
  {
    id: 'santekhnika',
    nodeId: '51011:74980',
    name: 'Сантехника',
    count: '24 услуг',
    image: '/master/santekhnika.png',
  },
  {
    id: 'elektrika',
    nodeId: '51011:74983',
    name: 'Электрика',
    count: '18 услуг',
    image: '/master/elektrika.png',
  },
  {
    id: 'mebel',
    nodeId: '51011:74986',
    name: 'Сборка мебели',
    count: '16 услуг',
    image: '/master/mebel.png',
  },
  {
    id: 'otdelka',
    nodeId: '51011:74989',
    name: 'Отделка',
    count: '21 услуг',
    image: '/master/otdelka.png',
  },
  {
    id: 'dveri',
    nodeId: '51011:74993',
    name: 'Двери и окна',
    count: '12 услуг',
    image: '/master/dveri.png',
  },
  {
    id: 'tekhnika',
    nodeId: '51011:74996',
    name: 'Бытовая техника',
    count: '9 услуг',
    image: '/master/tekhnika.png',
  },
  {
    id: 'sanuzel',
    nodeId: '51011:74999',
    name: 'Санузел',
    count: '14 услуг',
    image: '/master/sanuzel.png',
  },
  {
    id: 'prochee',
    nodeId: '51011:75002',
    name: 'Прочее',
    count: '8 услуг',
    image: '/master/prochee.png',
  },
];

const QUICK_CHIPS = [
  { label: 'Заменить смеситель', serviceId: 'svc_faucet_install' },
  { label: 'Повесить люстру', serviceId: 'svc_lighting_install' },
  { label: 'Собрать шкаф', serviceId: 'svc_furniture_assembly' },
  { label: 'Уложить ламинат', serviceId: 'svc_laminate_install' },
  { label: 'Подключить стиральную машину', serviceId: 'svc_washer_install' },
];

export const MasterLandingPage: React.FC<MasterLandingPageProps> = ({
  onSelectService,
  onOpenOrderCabinet,
  onStartApplication,
  activeOrderSummary,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryId | 'all'>('all');
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const catalogRef = useRef<HTMLDivElement | null>(null);

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allServices.filter((svc) => {
      const matchesCategory =
        selectedCategory === 'all' || svc.category === selectedCategory;
      const matchesQuery =
        !q ||
        svc.title.toLowerCase().includes(q) ||
        (svc.categoryLabel && svc.categoryLabel.toLowerCase().includes(q)) ||
        svc.includes.some((inc) => inc.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const activeCategoryName = useMemo(() => {
    if (selectedCategory === 'all') return 'Популярные и востребованные услуги';
    const found = SERVICE_CATEGORIES.find((c) => c.id === selectedCategory);
    return found ? `Услуги категории «${found.name}»` : 'Услуги';
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectCategoryCard = (catId: ServiceCategoryId) => {
    if (selectedCategory === catId) {
      setSelectedCategory('all');
    } else {
      setSelectedCategory(catId);
      setSearchQuery('');
      setTimeout(() => {
        catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Header Intro (Figma 51011:74768) */}
      <div className="space-y-2">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#6E6E73]">
          OMA МАСТЕР
        </span>
        <h1 className="text-[28px] sm:text-[36px] lg:text-[44px] font-medium text-[#111111] leading-tight">
          Мастер по фиксированной цене
        </h1>
        <p className="text-[15px] sm:text-[17px] text-[#6E6E73] max-w-2xl leading-[24px]">
          Проверенные мастера для ремонта и домашних задач. Стоимость известна заранее, материалы и
          расходники из ОМА в одном заказе, официальная гарантия — 12 месяцев.
        </p>
      </div>

      {/* 2. Search Panel (Figma 51011:74772) */}
      <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#E2E4E8] shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#9A9BA1]">
              <Magnifier />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Что нужно сделать? Например: заменить смеситель, повесить люстру или уложить ламинат"
              className="w-full h-[52px] bg-white border border-[#E2E4E8] rounded-[12px] pl-11 pr-4 text-[15px] text-[#111111] placeholder:text-[#6E6E73] outline-none focus:border-[#005DD6] transition-colors"
            />
          </div>
          <Button
            type="submit"
            view="action"
            size="xl"
            className="!h-[52px] !rounded-[12px] !px-8 !bg-[#005DD6] hover:!bg-[#004EB8] !text-white !font-medium !text-[15px] shrink-0"
          >
            Найти услугу
          </Button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] text-[#6E6E73]">Часто заказывают:</span>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.serviceId}
              type="button"
              onClick={() => {
                const target = allServices.find((s) => s.id === chip.serviceId);
                if (target) onSelectService(target);
              }}
              className="h-[30px] px-3.5 rounded-full bg-[#F4F4F6] hover:bg-[#EDF4FF] text-[#111111] hover:text-[#005DD6] text-[13px] font-normal transition-colors cursor-pointer border border-[#E2E4E8]"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Service Categories Grid with Background Photos (Figma 51011:74979 & 51011:74992) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[22px] sm:text-[24px] font-medium text-[#111111] leading-[28px]">
            Что нужно сделать?
          </h2>
          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="text-[14px] font-medium text-[#005DD6] hover:underline cursor-pointer"
            >
              Показать все категории ({allServices.length})
            </button>
          )}
        </div>

        {/* Row 1 (51011:74979) + Row 2 (51011:74992) */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]"
          data-node-id="51011:74979"
          data-name="Категории услуг"
        >
          {SERVICE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => handleSelectCategoryCard(cat.id)}
                data-node-id={cat.nodeId}
                data-name="Custom / Панель"
                className={`content-stretch flex flex-col gap-[20px] items-start min-h-[104px] p-[20px] relative rounded-[24px] overflow-hidden cursor-pointer transition-all duration-200 group select-none ${
                  isSelected
                    ? 'ring-2 ring-[#005DD6] shadow-md'
                    : 'hover:shadow-md ring-1 ring-black/5 hover:ring-[#005DD6]/60'
                }`}
              >
                <img
                  alt={cat.name}
                  src={cat.image}
                  className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[24px] size-full group-hover:scale-[1.03] transition-transform duration-300"
                />
                <p className="relative z-10 font-medium leading-[24px] text-[#111111] group-hover:text-[#005DD6] transition-colors text-[17px] w-full">
                  {cat.name}
                </p>
                <p className="relative z-10 font-normal leading-[20px] text-[#6E6E73] text-[15px] w-full">
                  {cat.count}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Interactive Services Catalog (Filtered by Category or Search) */}
      <div ref={catalogRef} className="space-y-5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[22px] sm:text-[24px] font-medium text-[#111111] leading-[28px]">
              {activeCategoryName}
            </h2>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`h-[34px] px-3.5 rounded-full text-[13px] font-medium shrink-0 transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#005DD6] text-white'
                  : 'bg-white border border-[#E2E4E8] text-[#6E6E73] hover:text-[#111111]'
              }`}
            >
              Все ({allServices.length})
            </button>
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`h-[34px] px-3.5 rounded-full text-[13px] font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#005DD6] text-white'
                    : 'bg-white border border-[#E2E4E8] text-[#6E6E73] hover:text-[#111111]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-[24px] p-8 border border-[#E2E4E8] text-center space-y-3">
            <p className="text-[17px] font-medium text-[#111111]">
              По запросу «{searchQuery}» точного тарифа не найдено
            </p>
            <p className="text-[14px] text-[#6E6E73] max-w-md mx-auto">
              Оставьте заявку на «Мастер на час» или сбросьте фильтр — система ОМА подберёт профильного специалиста под вашу задачу.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button
                view="normal"
                size="l"
                className="!rounded-[12px]"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Сбросить фильтр
              </Button>
              <Button
                view="action"
                size="l"
                className="!rounded-[12px] !bg-[#005DD6] !text-white"
                onClick={() => {
                  const handyman = allServices.find((s) => s.id === 'svc_handyman_hour') || allServices[0];
                  onStartApplication(handyman);
                }}
              >
                Вызвать мастера на час
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((svc) => {
              const bonusPoints = Math.max(2, Math.round(svc.price * (svc.bonusRate || 0.05)));
              return (
                <div
                  key={svc.id}
                  onClick={() => onSelectService(svc)}
                  className="bg-white rounded-[20px] overflow-hidden border border-[#E2E4E8] hover:border-[#005DD6] hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer group"
                >
                  {/* Service Photo with Badges & Price Overlay */}
                  <div className="relative h-[170px] w-full overflow-hidden bg-[#F4F4F6]">
                    <img
                      src={svc.image || `/services/${svc.id}.jpg`}
                      alt={svc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {svc.categoryLabel || 'Раздел'}
                      </span>
                      {svc.type === 'fixed' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#005DD6] text-white shadow-xs">
                          Фиксированная цена
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#B25E00] text-white shadow-xs">
                          По смете
                        </span>
                      )}
                    </div>

                    {/* Price & Duration on bottom of photo */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-[19px] font-bold tracking-tight drop-shadow-md">
                        {svc.type === 'fixed' ? `${formatBYN(svc.price)}` : `от ${formatBYN(svc.price)}`}
                        {svc.unit && <span className="text-[12px] font-normal opacity-85 ml-1">/ {svc.unit}</span>}
                      </span>
                      <span className="text-[11px] font-medium bg-black/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10">
                        {svc.duration}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                    <div className="space-y-2">
                      {/* Title */}
                      <h3 className="text-[16px] font-semibold text-[#111111] group-hover:text-[#005DD6] transition-colors leading-[22px]">
                        {svc.title}
                      </h3>

                      {/* Included checklist preview */}
                      {svc.includes && svc.includes.length > 0 && (
                        <p className="text-[12px] text-[#6E6E73] line-clamp-2 leading-relaxed">
                          ✓ {svc.includes.slice(0, 2).join(' · ')}
                        </p>
                      )}
                    </div>

                    {/* Footer: Bonuses & Button */}
                    <div className="pt-3 border-t border-[#E2E4E8]/60 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#005DD6] bg-[#EDF4FF] px-2.5 py-1 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-[#005DD6]" />
                        +{bonusPoints} Б на «Баланс»
                      </span>

                      <Button
                        view="normal"
                        size="m"
                        className="!rounded-[10px] !font-medium !text-[13px] hover:!border-[#005DD6] hover:!text-[#005DD6]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectService(svc);
                        }}
                      >
                        Подробнее
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Partner Banner ("Станьте мастером OMA", Figma 51011:75231) */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#E2E4E8] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <h3 className="text-[20px] sm:text-[22px] font-medium text-[#111111]">
            Станьте мастером OMA
          </h3>
          <p className="text-[14px] text-[#6E6E73] leading-relaxed">
            Получайте готовые заказы рядом с домом с уже подобранными материалами ОМА. Прозрачные
            выплаты сразу после приёмки и поддержка куратора.
          </p>
        </div>
        <Button
          view="normal"
          size="l"
          className="!h-[48px] !rounded-[12px] !px-6 !font-medium self-start sm:self-auto shrink-0"
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
              <div className="w-12 h-12 rounded-full bg-[#EDF4FF] text-[#005DD6] flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-[18px] font-bold text-[#111111]">Спасибо за отклик!</h3>
              <p className="text-[13px] text-[#6E6E73]">
                Куратор сервиса «ОМА Мастер» свяжется с вами в течение рабочего дня для подтверждения квалификации.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <p className="text-[13px] text-[#6E6E73]">
                Заполните контактные данные для аттестации в сервисе «ОМА Мастер».
              </p>
              <TextInput placeholder="Ваше имя и фамилия" size="l" className="w-full" />
              <TextInput placeholder="Номер телефона (+375 ...)" size="l" className="w-full" />
              <TextInput
                placeholder="Профиль (сантехника, электрика, сборка мебели, отделка)"
                size="l"
                className="w-full"
              />
              <Button
                view="action"
                size="l"
                width="max"
                className="!h-[48px] !rounded-[12px] !bg-[#005DD6] !text-white !font-medium mt-2"
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
