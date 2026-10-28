import React, { useMemo } from 'react';
import { House } from '@gravity-ui/icons';

export interface AddressData {
  city: string;
  street: string;
  house: string;
}

interface GoogleMapPickerProps {
  city: string;
  street: string;
  house: string;
  onAddressChange?: (newAddress: Partial<AddressData>) => void;
  className?: string;
}

export const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  city,
  street,
  house,
  className = '',
}) => {
  // Google Maps search query based on user entered address
  const googleEmbedQuery = useMemo(() => {
    const full = `${city || 'Минск'}, ${street || ''} ${house || ''}`.trim();
    return full || city || 'Минск';
  }, [city, street, house]);

  return (
    <div className={`space-y-2.5 pt-2 border-t border-[#E2E4E8] ${className}`}>
      {/* Top Bar: Title & City */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <House className="w-4 h-4 text-[#005DD6]" />
          <span className="text-[13px] font-semibold text-[#111111]">
            Карта выезда мастера (Google Maps) · {city || 'Минск'}
          </span>
        </div>
        <span className="text-[12px] text-[#2D8B5D] font-medium bg-[#EDF9F0] px-2.5 py-0.5 rounded-full border border-[#2D8B5D]/20">
          Бесплатный выезд
        </span>
      </div>

      {/* Google Maps Embed iframe (No API key, zero scripts) */}
      <div className="w-full h-[240px] sm:h-[280px] rounded-[16px] overflow-hidden border border-[#E2E4E8] bg-[#F4F4F6] relative shadow-xs">
        <iframe
          title="Google Maps"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={`https://maps.google.com/maps?q=${encodeURIComponent(googleEmbedQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#6E6E73] px-1">
        <span>Зона обслуживания мастера: весь город и до 15 км от МКАД</span>
        <span className="text-[#6E6E73]">Адрес обновляется по полям ввода</span>
      </div>
    </div>
  );
};
