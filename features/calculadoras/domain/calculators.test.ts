import { describe, expect, it } from 'vitest';
import {
  calcAtualizacaoIndice,
  calcHonorarios,
  calcJurosCompostos,
  calcJurosSimples,
  calcPrazoProcessual,
  calcRescisao
} from './calculators';

describe('calculadoras', () => {
  it('calcula juros simples', () => {
    const result = calcJurosSimples({
      principal: '100000',
      taxa: '2,00',
      taxaUnidade: 'mensal',
      periodo: 3,
      periodoUnidade: 'meses'
    });
    expect(result.results[0].value).toContain('R$');
    expect(result.raw.jurosCents).toBe(6000);
  });

  it('calcula juros compostos', () => {
    const result = calcJurosCompostos({
      principal: '100000',
      taxa: '1,00',
      capitalizacao: 'mensal',
      periodo: 2,
      periodoUnidade: 'meses',
      baseDiaria: 360
    });
    expect(result.raw.montanteCents).toBeGreaterThan(100000);
  });

  it('calcula atualização por índice manual', () => {
    const result = calcAtualizacaoIndice({
      valorInicial: '200000',
      dataInicial: '2024-01-01',
      dataFinal: '2024-12-31',
      indiceNome: 'Manual',
      percentualManual: '10,00'
    });
    expect(result.raw.corrigidoCents).toBe(220000);
  });

  it('calcula prazo processual simples', () => {
    const result = calcPrazoProcessual({
      dataInicial: '2026-01-02',
      dias: 5,
      tipo: 'corridos',
      feriados: ''
    });
    expect(result.raw.endDate).toBe('2026-01-07');
  });

  it('calcula honorários', () => {
    const result = calcHonorarios({
      proveito: '100000',
      percentualHonorarios: '10,00',
      percentualSucumbencia: '5,00'
    });
    expect(result.raw.totalCents).toBe(15000);
  });

  it('calcula rescisão básica', () => {
    const result = calcRescisao({
      salario: '300000',
      admissao: '2023-01-01',
      desligamento: '2024-01-10',
      tipo: 'sem_justa',
      aviso: 'indenizado',
      feriasVencidas: true,
      feriasProporcionais: true,
      decimoTerceiro: true
    });
    expect(result.raw.total).toBeGreaterThan(0);
  });
});
