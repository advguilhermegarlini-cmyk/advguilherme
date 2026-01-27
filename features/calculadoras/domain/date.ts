export const formatDateBR = (isoDate: string) => {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('pt-BR');
};

export const diffInDays = (start: Date, end: Date) => {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const parseHolidayList = (raw: string) => {
  if (!raw) return new Set<string>();
  const list = raw
    .split(/[,\n;]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return new Set(list);
};

export const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const calculateDeadline = (
  startDate: string,
  days: number,
  isBusinessDays: boolean,
  holidays: Set<string>
) => {
  const warnings: string[] = [];
  if (!startDate || days <= 0) {
    return { endDate: '', warnings: ['Informe a data inicial e o número de dias.'] };
  }
  let current = new Date(`${startDate}T00:00:00`);
  let remaining = days;
  while (remaining > 0) {
    current = addDays(current, 1);
    const iso = current.toISOString().slice(0, 10);
    const holiday = holidays.has(iso);
    if (isBusinessDays) {
      if (isWeekend(current) || holiday) {
        continue;
      }
    }
    remaining -= 1;
  }
  if (holidays.size > 0) {
    warnings.push('Feriados considerados apenas pelos informados manualmente.');
  }
  return { endDate: current.toISOString().slice(0, 10), warnings };
};
