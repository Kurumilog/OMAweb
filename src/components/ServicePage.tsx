import React, { useState, useMemo } from 'react';
import { Button, Disclosure } from '@gravity-ui/uikit';
import { ArrowLeft, Check, CircleCheck, ShieldCheck, Clock } from '@gravity-ui/icons';
import { Service, Product } from '../types';
import productsData from '../data/products.json';
import { ProductCard } from './ProductCard';
import { formatBYN } from '../config/loyalty';

const allProducts = productsData as Product[];

interface ServicePageProps {
  service: Service;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onGoToCatalog: () => void;
  onStartApplication: (service: Service, productSource: 'oma' | 'own') => void;
}

export const ServicePage: React.FC<ServicePageProps> = ({
  service,
  onBack,
  onSelectProduct,
  onGoToCatalog,
  onStartApplication,
}) => {
  const [productSource, setProductSource] = useState<'oma' | 'own'>('oma');

  // Find 2 matching products that link to this service
  const matchingProducts = useMemo(() => {
    const list = allProducts.filter((p) => p.serviceId === service.id || p.installable);
    return list.slice(0, 2);
  }, [service.id]);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center justify-between text-xs text-oma-text-secondary">
        <div className="flex items-center space-x-1.5 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-oma-blue transition-colors cursor-pointer"
          >
            Главная
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={onBack}
            className="hover:text-oma-blue transition-colors cursor-pointer"
          >
            ОМА Мастер
          </button>
          <span>/</span>
          <span className="text-oma-text font-medium truncate max-w-xs">{service.title}</span>
        </div>
      </div>

      {/* 2. Header & Intro (Figma 51011:75415) */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-oma-text leading-tight">
          {service.title}
        </h1>
        <p className="text-base text-oma-text-secondary">
          Профессиональная установка с официальной гарантией 12 месяцев от сети ОМА
        </p>
      </div>

      {/* 3. Main 2-Column Layout: Details (Left) / Order Panel (Right 360px) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Work Scope Panel (Figma 51011:75420) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm space-y-5">
            <h2 className="text-xl sm:text-2xl font-bold text-oma-text">
              Аккуратно установим и всё проверим
            </h2>
            <p className="text-sm text-oma-text-secondary leading-relaxed">
              Мастер демонтирует старое оборудование, выполнит аккуратный монтаж, подключит подводку и
              проверит работоспособность и герметичность соединений.
            </p>

            {/* Accordions */}
            <div className="space-y-2 pt-2 border-y border-oma-border py-4">
              <Disclosure
                summary={<span className="text-sm font-semibold text-oma-text">Что входит</span>}
                defaultExpanded
              >
                <ul className="text-xs text-oma-text-secondary space-y-1.5 pt-2 pl-2">
                  {service.includes.map((inc, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-oma-blue shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </Disclosure>

              <Disclosure
                summary={<span className="text-sm font-semibold text-oma-text">Что не входит</span>}
              >
                <ul className="text-xs text-oma-text-secondary space-y-1.5 pt-2 pl-2">
                  {service.excludes.map((exc, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-oma-text-tertiary">✕</span>
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </Disclosure>
            </div>

            <div className="space-y-1.5 pt-1">
              <h3 className="text-sm font-bold text-oma-text">Входит в фиксированную цену</h3>
              <p className="text-xs text-oma-text-secondary">
                Демонтаж · Установка · Подключение · Проверка работы · Уборка мусора
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <h3 className="text-sm font-bold text-oma-text">Не входит</h3>
              <p className="text-xs text-oma-text-secondary leading-relaxed">
                Расходные материалы, переделка коммуникаций и нестандартные доработки. Любые дополнительные
                работы производятся только после согласования с вами.
              </p>
            </div>
          </div>

          {/* Required Products Section (Figma 51011:75498) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm space-y-5">
            <h2 className="text-xl sm:text-2xl font-bold text-oma-text">Товары для установки</h2>
            <p className="text-xs text-oma-text-secondary">
              Вы можете заказать товар в ОМА вместе с установкой со скидкой или использовать свой товар.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matchingProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>

            <Button
              view="normal"
              size="l"
              className="!rounded-xl !font-semibold"
              onClick={onGoToCatalog}
            >
              Смотреть все товары в каталоге ОМА
            </Button>
          </div>
        </div>

        {/* Right Column: Order Panel (360px / 4 cols) (Figma 51011:75744) */}
        <div className="lg:col-span-4 sticky top-6">
          <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-5">
            <span className="inline-flex items-center text-xs font-semibold text-oma-blue bg-oma-tint px-3 py-1 rounded-full">
              Фиксированная цена
            </span>

            <div className="text-4xl font-extrabold text-oma-text">
              {formatBYN(service.price)}
            </div>

            <div className="space-y-2 text-xs text-oma-text border-y border-oma-border py-3">
              <div className="flex items-center justify-between">
                <span className="text-oma-text-secondary">Срок выезда</span>
                <span className="font-semibold text-oma-text">в течение 1–3 дней</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-oma-text-secondary">Гарантия</span>
                <span className="font-semibold text-oma-text">12 месяцев</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-oma-text-secondary">Бонусы «Баланс»</span>
                <span className="font-semibold text-oma-blue">+3 Б после приёмки</span>
              </div>
            </div>

            {/* Segmented Switcher: Товар купил в OMA / Товар свой */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-oma-text">Происхождение товара:</label>
              <div className="flex rounded-xl bg-[#ecedf0] p-1 border border-oma-border/60">
                <button
                  type="button"
                  onClick={() => setProductSource('oma')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    productSource === 'oma'
                      ? 'bg-white text-oma-text font-bold shadow-sm'
                      : 'text-oma-text-secondary hover:text-oma-text'
                  }`}
                >
                  Товар купил в OMA
                </button>
                <button
                  type="button"
                  onClick={() => setProductSource('own')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    productSource === 'own'
                      ? 'bg-oma-blue text-white font-bold shadow-sm'
                      : 'text-oma-text-secondary hover:text-oma-text'
                  }`}
                >
                  Товар свой
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              view="action"
              size="xl"
              width="max"
              className="!h-[52px] !rounded-xl !font-semibold !text-base"
              onClick={() => onStartApplication(service, productSource)}
            >
              Заказать · {formatBYN(service.price)}
            </Button>

            <p className="text-[11px] text-oma-text-secondary text-center leading-relaxed">
              Стоимость материалов не включена. Дату, время и точный адрес вы укажете на следующем шаге.
            </p>
          </div>
        </div>
      </div>

      {/* 4. FAQ Accordions (Figma 51011:75842) */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl sm:text-2xl font-bold text-oma-text">Частые вопросы</h2>
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oma-border shadow-sm space-y-3">
          <Disclosure summary={<span className="text-sm font-semibold text-oma-text">Нужно ли покупать материалы заранее?</span>}>
            <p className="text-xs text-oma-text-secondary pt-2 leading-relaxed">
              Вы можете приобрести необходимые товары и расходники в гипермаркетах ОМА или интернет-магазине.
              Если чего-то не хватит, мастер согласует покупку по чеку.
            </p>
          </Disclosure>

          <Disclosure summary={<span className="text-sm font-semibold text-oma-text">Что если понадобятся дополнительные работы?</span>}>
            <p className="text-xs text-oma-text-secondary pt-2 leading-relaxed">
              Мастер согласует стоимость дополнительных услуг до начала выполнения. Никаких скрытых платежей:
              цена фиксируется и не меняется без вашего подтверждения.
            </p>
          </Disclosure>

          <Disclosure summary={<span className="text-sm font-semibold text-oma-text">Какая гарантия на выполненные работы?</span>}>
            <p className="text-xs text-oma-text-secondary pt-2 leading-relaxed">
              Официальная гарантия сети гипермаркетов ОМА составляет 12 месяцев. В случае неполадок мастер
              выезжает и устраняет их бесплатно.
            </p>
          </Disclosure>
        </div>
      </div>

      {/* 5. Advantages (Figma 51011:75934) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-2">
          <CircleCheck className="w-5 h-5 text-oma-blue" />
          <h3 className="text-base font-bold text-oma-text">Проверенные мастера</h3>
          <p className="text-xs text-oma-text-secondary leading-relaxed">
            Все мастера проходят аттестацию ОМА, имеют опыт от 5 лет и рейтинг от 4.8.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-2">
          <CircleCheck className="w-5 h-5 text-oma-blue" />
          <h3 className="text-base font-bold text-oma-text">Фиксированная цена</h3>
          <p className="text-xs text-oma-text-secondary leading-relaxed">
            Стоимость услуг зафиксирована в каталоге ОМА и не повышается на месте.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-oma-border shadow-sm space-y-2">
          <CircleCheck className="w-5 h-5 text-oma-blue" />
          <h3 className="text-base font-bold text-oma-text">Гарантия 12 месяцев</h3>
          <p className="text-xs text-oma-text-secondary leading-relaxed">
            Официальный акт выполненных работ и прямая ответственность сети ОМА.
          </p>
        </div>
      </div>
    </div>
  );
};
