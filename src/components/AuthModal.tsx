import React, { useState } from 'react';
import { Dialog, TextInput, Button, Checkbox, RadioGroup } from '@gravity-ui/uikit';
import { useUser } from '../context/UserContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, onSuccess }) => {
  const { user, registerUser } = useUser();
  const [phone, setPhone] = useState(user.phone || '+375 (29) 123-45-67');
  const [step, setStep] = useState<'phone' | 'sms'>('phone');
  const [smsCode, setSmsCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [cardType, setCardType] = useState('virtual');
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = () => {
    if (!phone || phone.length < 9) {
      setError('Введите корректный номер телефона');
      return;
    }
    if (!agreeTerms) {
      setError('Необходимо согласиться с условиями обработки данных');
      return;
    }
    setError(null);
    setStep('sms');
  };

  const handleVerifyCode = () => {
    if (!smsCode || smsCode.length < 4) {
      setError('Введите 4-значный код из SMS');
      return;
    }
    setError(null);
    registerUser(phone, user.name || 'Александр');
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleClose = () => {
    setStep('phone');
    setSmsCode('');
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
      hasCloseButton
      className="z-50"
    >
      <div className="w-[520px] max-w-full p-6 sm:p-8 space-y-6 bg-white rounded-2xl">
        {/* Header & Logo */}
        <div className="flex items-center justify-between pb-2 border-b border-oma-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-oma-blue flex items-center justify-center text-white font-extrabold text-sm">
              OMA
            </div>
            <span className="font-bold text-sm tracking-wide text-oma-text">
              ОМА · Личный кабинет
            </span>
          </div>
        </div>

        {/* Intro */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-oma-text leading-tight">
            Вход или регистрация
          </h2>
          <p className="text-sm text-oma-text-secondary mt-1">
            Сохраняйте заказы, выбирайте мастеров и копите бонусы
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <div className="space-y-5">
            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-oma-text">Номер телефона</label>
              <TextInput
                value={phone}
                onUpdate={(val) => {
                  setPhone(val);
                  if (error) setError(null);
                }}
                size="xl"
                placeholder="+375 (XX) XXX-XX-XX"
                className="w-full !rounded-xl"
              />
            </div>

            {/* Action CTA */}
            <Button
              view="action"
              size="xl"
              width="max"
              className="!h-[52px] !rounded-xl !font-semibold !text-base"
              onClick={handleSendCode}
            >
              Получить код
            </Button>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <Checkbox
                checked={agreeTerms}
                onUpdate={(checked) => setAgreeTerms(checked)}
                size="l"
              >
                <span className="text-xs text-oma-text">
                  Согласен с обработкой персональных данных
                </span>
              </Checkbox>
            </div>

            {/* Loyalty Card Option */}
            <div className="pt-2 border-t border-oma-border space-y-2">
              <span className="text-xs font-bold text-oma-text">Карта «Баланс»</span>
              <RadioGroup
                value={cardType}
                onUpdate={(val) => setCardType(val)}
                size="l"
                direction="vertical"
              >
                <RadioGroup.Option value="virtual">
                  <span className="text-xs text-oma-text">
                    Выбираем сами — новая виртуальная карта
                  </span>
                </RadioGroup.Option>
                <RadioGroup.Option value="existing">
                  <span className="text-xs text-oma-text">
                    У меня уже есть карта «Баланс»
                  </span>
                </RadioGroup.Option>
              </RadioGroup>
            </div>

            {/* Agreement Notice */}
            <p className="text-[11px] text-oma-text-secondary leading-relaxed pt-1">
              Продолжая, вы принимаете условия программы «Баланс» и пользовательское соглашение сети ОМА.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-oma-text">Код из SMS</label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-oma-blue hover:underline cursor-pointer"
                >
                  Изменить номер
                </button>
              </div>
              <p className="text-xs text-oma-text-secondary">
                Отправили 4-значный проверочный код на {phone}
              </p>
              <TextInput
                value={smsCode}
                onUpdate={(val) => {
                  setSmsCode(val);
                  if (error) setError(null);
                }}
                size="xl"
                placeholder="0000"
                className="w-full !rounded-xl text-center font-mono tracking-widest text-lg"
                autoFocus
              />
            </div>

            <Button
              view="action"
              size="xl"
              width="max"
              className="!h-[52px] !rounded-xl !font-semibold !text-base"
              onClick={handleVerifyCode}
            >
              Подтвердить и войти
            </Button>

            <button
              type="button"
              onClick={() => {
                setSmsCode('1234');
              }}
              className="w-full text-center text-xs text-oma-blue hover:underline cursor-pointer py-1"
            >
              Отправить код повторно (или ввести тестовый 1234)
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
};
