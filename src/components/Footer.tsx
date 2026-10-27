import React from 'react';

interface FooterProps {
  onGoHome?: () => void;
  onGoCatalog?: () => void;
  onOpenMaster?: () => void;
  onOpenLoyalty?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onGoHome,
  onGoCatalog,
  onOpenMaster,
  onOpenLoyalty,
}) => {
  return (
    <footer className="bg-white border-t border-[#E2E4E8] mt-16 w-full">
      <div className="max-w-[1440px] mx-auto px-10 py-10 flex flex-col md:flex-row gap-16 items-start justify-between">
        {/* Контакты — Figma node 51011:69771 */}
        <div className="flex flex-col gap-3 w-full md:w-[320px] shrink-0">
          <div className="h-[48px] flex items-center">
            <button
              type="button"
              onClick={onGoHome}
              className="cursor-pointer focus:outline-none"
              title="ОМА"
            >
              <img
                src="/logo_cropped.png"
                alt="ОМА"
                className="h-[40px] w-auto object-contain"
              />
            </button>
          </div>
          <p className="text-[15px] leading-[20px] text-[#111111]">
            Товары и мастера для вашего дома
          </p>
          <a
            href="tel:7770"
            className="text-[17px] leading-[24px] font-medium text-[#111111] hover:text-[#005DD6] transition-colors"
          >
            7770
          </a>
          <p className="text-[15px] leading-[20px] text-[#6E6E73]">
            Ежедневно, 8:00–22:00 · Беларусь
          </p>
        </div>

        {/* Раздел 1: О компании — Figma node 51011:69776 */}
        <div className="flex flex-col gap-4 text-[15px] leading-[20px] flex-1">
          <p className="font-medium text-[#111111]">
            О компании
          </p>
          <button
            type="button"
            onClick={onGoCatalog}
            className="text-left text-[#6E6E73] hover:text-[#005DD6] transition-colors cursor-pointer"
          >
            Магазины OMA
          </button>
          <a
            href="#delivery"
            onClick={(e) => {
              e.preventDefault();
              alert('Доставка курьером по всей Беларуси или бесплатный самовывоз из гипермаркетов ОМА.');
            }}
            className="text-[#6E6E73] hover:text-[#005DD6] transition-colors"
          >
            Доставка и самовывоз
          </a>
          <button
            type="button"
            onClick={onOpenLoyalty}
            className="text-left text-[#6E6E73] hover:text-[#005DD6] transition-colors cursor-pointer"
          >
            Программа «Баланс»
          </button>
        </div>

        {/* Раздел 2: Мастерам — Figma node 51011:69781 */}
        <div className="flex flex-col gap-4 text-[15px] leading-[20px] flex-1">
          <p className="font-medium text-[#111111]">
            Мастерам
          </p>
          <button
            type="button"
            onClick={onOpenMaster}
            className="text-left text-[#6E6E73] hover:text-[#005DD6] transition-colors cursor-pointer"
          >
            Станьте мастером OMA
          </button>
          <a
            href="#warranty"
            onClick={(e) => {
              e.preventDefault();
              alert('Все работы мастеров сервиса «ОМА Мастер» застрахованы и защищены гарантией ОМА 12 месяцев.');
            }}
            className="text-[#6E6E73] hover:text-[#005DD6] transition-colors"
          >
            Гарантия на работы
          </a>
          <a
            href="#support"
            onClick={(e) => {
              e.preventDefault();
              alert('Служба поддержки сервиса «ОМА Мастер»: master@oma.by · 7770');
            }}
            className="text-[#6E6E73] hover:text-[#005DD6] transition-colors"
          >
            Поддержка
          </a>
        </div>

        {/* Раздел 3: Партнерам / B2B — Figma node 51011:69786 */}
        <div className="flex flex-col gap-4 text-[15px] leading-[20px] flex-1">
          <p className="font-medium text-[#111111]">
            Партнерам / B2B
          </p>
          <a
            href="#cooperation"
            onClick={(e) => {
              e.preventDefault();
              alert('Отдел закупок и поставщиков ОМА: info@oma.by');
            }}
            className="text-[#6E6E73] hover:text-[#005DD6] transition-colors"
          >
            Сотрудничество
          </a>
          <a
            href="#b2b-orders"
            onClick={(e) => {
              e.preventDefault();
              alert('Оптовые поставки и комплектация объектов: b2b@oma.by · +375 (17) 330-33-33');
            }}
            className="text-[#6E6E73] hover:text-[#005DD6] transition-colors"
          >
            Оптовые заказы
          </a>
          <a
            href="https://www.oma.by"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6E6E73] hover:text-[#005DD6] transition-colors"
          >
            Контакты
          </a>
        </div>
      </div>

      <div className="border-t border-[#E2E4E8] py-4">
        <div className="max-w-[1440px] mx-auto px-10 flex flex-col sm:flex-row items-center justify-between text-[13px] text-[#9A9BA1]">
          <p>© 2026 ОМА. Официальный сайт сети гипермаркетов и сервиса «ОМА Мастер».</p>
          <a
            href="https://www.oma.by"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#005DD6] transition-colors"
          >
            oma.by
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
