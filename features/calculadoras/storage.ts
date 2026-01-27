import type { SaveSimulationPayload } from './types';

const STORAGE_KEY = 'simulacoes_calculadoras';

export const getUserId = () => {
  if (typeof window === 'undefined') return 'anon';
  const cached = window.localStorage.getItem('calc_user_id');
  if (cached) return cached;
  const next = `anon-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem('calc_user_id', next);
  return next;
};

export const saveSimulation = (payload: SaveSimulationPayload) => {
  if (typeof window === 'undefined') return;
  const current = window.localStorage.getItem(STORAGE_KEY);
  const list = current ? (JSON.parse(current) as SaveSimulationPayload[]) : [];
  list.push(payload);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};
