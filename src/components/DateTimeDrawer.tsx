import React, { useState } from 'react';
import { Drawer, Button, TextInput } from '@gravity-ui/uikit';
import { Xmark, ChevronLeft, ChevronRight, GeoPin, Clock, Calendar } from '@gravity-ui/icons';

interface DateTimeDrawerProps {
  open: boolean;
  onClose: () => void;
  serviceTitle: string;
  servicePrice: number;
  initialDate?: string;
  initialTimeSlot?: string;
  onConfirm: (date: string, timeSlot: string, address: string) => void;
}

interface DayOption {
  dayOfWeek: string;
  dayNumber: number;
  monthName: string;
  fullDateString: string;
  isPast?: boolean;
}

// Generate next 14 days starting from late October 2026 (matching design context or current schedule)
const DAYS_OF_WEEK = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

function generate14Days(): DayOption[] {
  // Anchor to 27 October 2026 as in the Figma mockup
  const base = new Date(2026, 9, 27); // Oct 27 2026 is Tuesday
  const days: DayOption[] = [];

  for (let i = 0; i < 14; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const dayOfWeek = DAYS_OF_WEEK[d.getDay()];
    const dayNumber = d.getDate();
    const monthName = MONTHS_GENITIVE[d.getMonth()];
    const fullDateString = `${dayNumber} ${monthName}`;
    days.push({
      dayOfWeek,
      dayNumber,
      monthName,
      fullDateString,
      isPast: i < 0,
    });
  }

  return days;
}

const SCHEDULE_DAYS = generate14Days();
const TIME_SLOTS = ['10–14', '13–18', '18–22'];

export const DateTimeDrawer: React.FC<DateTimeDrawerProps> = ({
  open,
  onClose,
  serviceTitle,
  servicePrice,
  initialDate,
  initialTimeSlot = '13–18',
  onConfirm,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(2); // default to 29 October (index 2)
  const [selectedSlot, setSelectedSlot] = useState(initialTimeSlot);
  const [address, setAddress] = useState('Минск, ул. Притыцкого, 10, кв. 24');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const selectedDay = SCHEDULE_DAYS[selectedDayIndex] || SCHEDULE_DAYS[0];

  const handleConfirm = () => {
    onConfirm(selectedDay.fullDateString, selectedSlot, address);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      placement="right"
      className="z-50"
    >
      <div className="w-[600px] max-w-full h-full bg-white flex flex-col justify-between p-8 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-oma-text leading-tight">
                Когда приехать мастеру?
              </h2>
              <p className="text-base text-oma-text-secondary mt-1">
                {serviceTitle} · {servicePrice} руб.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-oma-text-secondary hover:text-oma-text rounded-full hover:bg-oma-bg transition-colors"
              aria-label="Закрыть"
            >
              <Xmark className="w-5 h-5" />
            </button>
          </div>

          {/* Month & Nav */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-base font-semibold text-oma-text flex items-center gap-2">
              <Calendar className="w-4 h-4 text-oma-blue" />
              Октябрь — ноябрь 2026
            </span>
            <div className="flex items-center space-x-2 text-oma-text-secondary">
              <button
                type="button"
                className="p-1 hover:text-oma-text rounded"
                title="Предыдущая неделя"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1 hover:text-oma-text rounded"
                title="Следующая неделя"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 14 Days Grid (2 weeks of 7 days) */}
          <div className="space-y-2">
            {/* Week 1 */}
            <div className="grid grid-cols-7 gap-2">
              {SCHEDULE_DAYS.slice(0, 7).map((d, idx) => {
                const isSelected = selectedDayIndex === idx;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[11px] text-oma-text-secondary">{d.dayOfWeek}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`w-full h-10 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'bg-oma-blue text-white shadow-sm font-bold'
                          : 'bg-[#ecedf0] text-oma-text hover:bg-oma-border'
                      }`}
                    >
                      {d.dayNumber}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Week 2 */}
            <div className="grid grid-cols-7 gap-2 pt-1">
              {SCHEDULE_DAYS.slice(7, 14).map((d, idx) => {
                const actualIndex = idx + 7;
                const isSelected = selectedDayIndex === actualIndex;
                return (
                  <div key={actualIndex} className="flex flex-col items-center gap-1">
                    <span className="text-[11px] text-oma-text-secondary">{d.dayOfWeek}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedDayIndex(actualIndex)}
                      className={`w-full h-10 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'bg-oma-blue text-white shadow-sm font-bold'
                          : 'bg-[#ecedf0] text-oma-text hover:bg-oma-border'
                      }`}
                    >
                      {d.dayNumber}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Summary & Time Slots */}
          <div className="pt-2 space-y-3">
            <p className="text-sm font-medium text-oma-text-secondary">
              Выбрано: <span className="text-oma-text font-semibold">{selectedDay.dayNumber} {selectedDay.monthName}, {selectedDay.dayOfWeek.toLowerCase()}</span>
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-oma-text-secondary mr-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Время:
              </span>
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-oma-tint text-oma-blue border-oma-blue font-semibold'
                        : 'bg-[#ecedf0] text-oma-text-secondary border-transparent hover:text-oma-text'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className="bg-oma-tint rounded-2xl p-4 border border-oma-blue/20">
            <p className="text-sm text-oma-text leading-relaxed">
              Рекомендуем назначить установку через 24 часа после доставки, чтобы товар успел акклиматизироваться в помещении.
            </p>
          </div>

          {/* Address Block */}
          <div className="pt-2 border-t border-oma-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-oma-text flex items-center gap-1.5">
                <GeoPin className="w-4 h-4 text-oma-blue" />
                Адрес проведения работ
              </span>
              <button
                type="button"
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="text-xs font-medium text-oma-blue hover:underline cursor-pointer"
              >
                {isEditingAddress ? 'Сохранить' : 'Изменить'}
              </button>
            </div>

            {isEditingAddress ? (
              <TextInput
                value={address}
                onUpdate={(val) => setAddress(val)}
                size="l"
                className="w-full"
                placeholder="Город, улица, дом, квартира"
              />
            ) : (
              <p className="text-sm text-oma-text bg-oma-surface-alt px-3.5 py-2.5 rounded-xl border border-oma-border/60">
                {address}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-oma-border space-y-2">
          <Button
            view="action"
            size="xl"
            width="max"
            className="!h-[52px] !rounded-xl !font-semibold !text-base"
            onClick={handleConfirm}
          >
            Выбрать · {servicePrice} руб.
          </Button>
          <p className="text-xs text-center text-oma-text-secondary">
            Бесплатная отмена за 24 часа до визита. Мастер приедет с договором и чеком.
          </p>
        </div>
      </div>
    </Drawer>
  );
};
