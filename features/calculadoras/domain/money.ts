const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCentsToBRL = (cents: number, withSymbol = true) => {
  const value = cents / 100;
  if (withSymbol) {
    return brlFormatter.format(value);
  }
  return numberFormatter.format(value);
};

export const formatMoneyInput = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const int = parseInt(digits, 10);
  const cents = int % 100;
  const whole = Math.floor(int / 100);
  const wholeStr = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${wholeStr || '0'},${cents.toString().padStart(2, '0')}`;
};

export const parseMoneyToCents = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10);
};

export const formatPercentInput = (raw: string) => {
  const sanitized = raw.replace(/[^\d,]/g, '').replace(/(,.*),/g, '$1');
  if (!sanitized) return '';
  const [intPart, decPart] = sanitized.split(',');
  const trimmedDec = (decPart || '').slice(0, 2);
  return trimmedDec ? `${intPart},${trimmedDec}` : intPart;
};

export const parsePercentToDecimal = (raw: string) => {
  if (!raw) return 0;
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const value = Number.parseFloat(normalized);
  if (Number.isNaN(value)) return 0;
  return value / 100;
};

export const formatPercent = (value: number) => {
  const pct = value * 100;
  return `${numberFormatter.format(pct)}%`;
};

export const safeRoundCents = (value: number) => Math.round(value);
