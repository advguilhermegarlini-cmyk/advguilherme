import { formatCentsToBRL, formatPercent, parsePercentToDecimal, safeRoundCents } from './money';
import { calculateDeadline, formatDateBR } from './date';
import type { CalcResult } from '../types';

const monthBase = 30;
const yearBase = 360;

const normalizeTime = (
  rateUnit: 'mensal' | 'anual',
  periodValue: number,
  periodUnit: 'dias' | 'meses' | 'anos'
) => {
  let t = 0;
  const warnings: string[] = [];
  if (rateUnit === 'mensal') {
    if (periodUnit === 'meses') t = periodValue;
    if (periodUnit === 'anos') t = periodValue * 12;
    if (periodUnit === 'dias') {
      t = periodValue / monthBase;
      warnings.push('Conversão de dias para meses usando base 30 dias/mês.');
    }
  }
  if (rateUnit === 'anual') {
    if (periodUnit === 'anos') t = periodValue;
    if (periodUnit === 'meses') t = periodValue / 12;
    if (periodUnit === 'dias') {
      t = periodValue / yearBase;
      warnings.push('Conversão de dias para anos usando base 360 dias/ano.');
    }
  }
  return { t, warnings };
};

export const calcJurosSimples = (input: {
  principal: string;
  taxa: string;
  taxaUnidade: 'mensal' | 'anual';
  periodo: number;
  periodoUnidade: 'dias' | 'meses' | 'anos';
}): CalcResult => {
  const principalCents = Number(input.principal);
  const taxaDecimal = parsePercentToDecimal(input.taxa);
  const { t, warnings } = normalizeTime(input.taxaUnidade, input.periodo, input.periodoUnidade);
  const jurosCents = safeRoundCents(principalCents * taxaDecimal * t);
  const totalCents = principalCents + jurosCents;
  return {
    title: 'Juros Simples',
    inputs: [
      `Principal: ${formatCentsToBRL(principalCents)}`,
      `Taxa: ${formatPercent(taxaDecimal)} ao ${input.taxaUnidade}`,
      `Período: ${input.periodo} ${input.periodoUnidade}`
    ],
    formula: 'J = P × i × t',
    steps: [
      `i = ${formatPercent(taxaDecimal)} (${input.taxaUnidade})`,
      `t = ${t.toFixed(4).replace('.', ',')} período(s)`,
      `J = ${formatCentsToBRL(principalCents, false)} × ${taxaDecimal.toFixed(6).replace('.', ',')} × ${t.toFixed(4).replace('.', ',')}`
    ],
    results: [
      { label: 'Juros', value: formatCentsToBRL(jurosCents) },
      { label: 'Total (Principal + Juros)', value: formatCentsToBRL(totalCents) }
    ],
    warnings,
    raw: { principalCents, taxaDecimal, t, jurosCents, totalCents }
  };
};

export const calcJurosCompostos = (input: {
  principal: string;
  taxa: string;
  capitalizacao: 'mensal' | 'anual' | 'diaria';
  periodo: number;
  periodoUnidade: 'dias' | 'meses' | 'anos';
  baseDiaria: 360 | 365;
}): CalcResult => {
  const principalCents = Number(input.principal);
  const taxaDecimal = parsePercentToDecimal(input.taxa);
  let t = 0;
  const warnings: string[] = [];
  if (input.capitalizacao === 'mensal') {
    if (input.periodoUnidade === 'meses') t = input.periodo;
    if (input.periodoUnidade === 'anos') t = input.periodo * 12;
    if (input.periodoUnidade === 'dias') {
      t = input.periodo / monthBase;
      warnings.push('Conversão de dias para meses usando base 30 dias/mês.');
    }
  }
  if (input.capitalizacao === 'anual') {
    if (input.periodoUnidade === 'anos') t = input.periodo;
    if (input.periodoUnidade === 'meses') t = input.periodo / 12;
    if (input.periodoUnidade === 'dias') {
      t = input.periodo / yearBase;
      warnings.push('Conversão de dias para anos usando base 360 dias/ano.');
    }
  }
  if (input.capitalizacao === 'diaria') {
    const base = input.baseDiaria;
    if (input.periodoUnidade === 'dias') t = input.periodo;
    if (input.periodoUnidade === 'meses') t = (base / 12) * input.periodo;
    if (input.periodoUnidade === 'anos') t = base * input.periodo;
    warnings.push(`Capitalização diária usando base ${base} dias/ano.`);
  }
  const montanteCents = safeRoundCents(principalCents * Math.pow(1 + taxaDecimal, t));
  const jurosCents = montanteCents - principalCents;
  return {
    title: 'Juros Compostos',
    inputs: [
      `Principal: ${formatCentsToBRL(principalCents)}`,
      `Taxa: ${formatPercent(taxaDecimal)} ao período de capitalização`,
      `Período: ${input.periodo} ${input.periodoUnidade}`,
      `Capitalização: ${input.capitalizacao}`
    ],
    formula: 'M = P × (1 + i)^t',
    steps: [
      `i = ${formatPercent(taxaDecimal)}`,
      `t = ${t.toFixed(4).replace('.', ',')} período(s)`,
      `M = ${formatCentsToBRL(principalCents, false)} × (1 + ${taxaDecimal.toFixed(6).replace('.', ',')})^${t.toFixed(4).replace('.', ',')}`
    ],
    results: [
      { label: 'Montante', value: formatCentsToBRL(montanteCents) },
      { label: 'Juros', value: formatCentsToBRL(jurosCents) }
    ],
    warnings,
    raw: { principalCents, taxaDecimal, t, montanteCents, jurosCents }
  };
};

export const calcAtualizacaoIndice = (input: {
  valorInicial: string;
  dataInicial: string;
  dataFinal: string;
  indiceNome: string;
  percentualManual: string;
}): CalcResult => {
  const inicialCents = Number(input.valorInicial);
  const indiceDecimal = parsePercentToDecimal(input.percentualManual);
  const corrigidoCents = safeRoundCents(inicialCents * (1 + indiceDecimal));
  const diferencaCents = corrigidoCents - inicialCents;
  return {
    title: 'Atualização por Índice',
    inputs: [
      `Valor inicial: ${formatCentsToBRL(inicialCents)}`,
      `Período: ${formatDateBR(input.dataInicial)} a ${formatDateBR(input.dataFinal)}`,
      `Índice: ${input.indiceNome || 'Manual'} (${formatPercent(indiceDecimal)})`
    ],
    formula: 'Vf = Vi × (1 + índice)',
    steps: [
      `Índice acumulado: ${formatPercent(indiceDecimal)}`,
      `Vf = ${formatCentsToBRL(inicialCents, false)} × (1 + ${indiceDecimal.toFixed(6).replace('.', ',')})`
    ],
    results: [
      { label: 'Valor corrigido', value: formatCentsToBRL(corrigidoCents) },
      { label: 'Diferença', value: formatCentsToBRL(diferencaCents) }
    ],
    warnings: ['Índice informado manualmente. Estimativa sem consulta automática.'],
    raw: { inicialCents, indiceDecimal, corrigidoCents, diferencaCents }
  };
};

const monthsBetween = (start: Date, end: Date) => {
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  return years * 12 + months + 1;
};

const calcAvPrevioDias = (years: number) => {
  if (years <= 1) return 30;
  const extra = Math.min((years - 1) * 3, 60);
  return 30 + extra;
};

export const calcRescisao = (input: {
  salario: string;
  admissao: string;
  desligamento: string;
  tipo: 'pedido' | 'sem_justa' | 'justa' | 'acordo';
  aviso: 'indenizado' | 'trabalhado' | 'nao_aplicavel';
  feriasVencidas: boolean;
  feriasProporcionais: boolean;
  decimoTerceiro: boolean;
}): CalcResult => {
  const salarioCents = Number(input.salario);
  const admissao = new Date(`${input.admissao}T00:00:00`);
  const desligamento = new Date(`${input.desligamento}T00:00:00`);
  const totalMonths = Math.max(monthsBetween(admissao, desligamento), 1);
  const years = Math.max(desligamento.getFullYear() - admissao.getFullYear(), 0) + 1;
  const diaDesligamento = Math.min(desligamento.getDate(), monthBase);
  const saldoSalario = safeRoundCents((salarioCents / monthBase) * diaDesligamento);
  let avisoPrevio = 0;
  const avisoDias = calcAvPrevioDias(years);
  if (input.aviso !== 'nao_aplicavel' && input.tipo !== 'justa' && input.tipo !== 'pedido') {
    avisoPrevio = safeRoundCents((salarioCents / monthBase) * avisoDias);
  }
  let decimoTerceiro = 0;
  if (input.decimoTerceiro) {
    const mesesNoAno = desligamento.getMonth() + 1;
    decimoTerceiro = safeRoundCents((salarioCents / 12) * mesesNoAno);
  }
  let feriasVencidas = 0;
  if (input.feriasVencidas) {
    feriasVencidas = safeRoundCents(salarioCents * 1.3333333);
  }
  let feriasProporcionais = 0;
  if (input.feriasProporcionais) {
    const mesesProporcionais = Math.min(totalMonths, 12);
    feriasProporcionais = safeRoundCents((salarioCents / 12) * mesesProporcionais * 1.3333333);
  }
  let multaFgts = 0;
  let fgtsBase = safeRoundCents(salarioCents * 0.08 * totalMonths);
  if (input.tipo === 'sem_justa') multaFgts = safeRoundCents(fgtsBase * 0.4);
  if (input.tipo === 'acordo') multaFgts = safeRoundCents(fgtsBase * 0.2);
  const total =
    saldoSalario +
    avisoPrevio +
    decimoTerceiro +
    feriasVencidas +
    feriasProporcionais +
    multaFgts;
  const warnings = [
    'Estimativa baseada em mês comercial (30 dias) e parâmetros informados.',
    'FGTS calculado de forma estimada (8% do salário por mês).',
    'Valores podem variar conforme convenções coletivas e detalhes contratuais.'
  ];
  return {
    title: 'Rescisão Trabalhista (Estimativa)',
    inputs: [
      `Salário base: ${formatCentsToBRL(salarioCents)}`,
      `Admissão: ${formatDateBR(input.admissao)}`,
      `Desligamento: ${formatDateBR(input.desligamento)}`,
      `Tipo: ${input.tipo.replace('_', ' ')}`
    ],
    formula: 'Soma de verbas rescisórias conforme parâmetros',
    steps: [
      `Saldo de salário: (${diaDesligamento} dias / 30) × salário`,
      `Aviso prévio: ${avisoPrevio ? `${avisoDias} dias` : 'não aplicável'}`,
      `13º proporcional: ${input.decimoTerceiro ? 'considerado' : 'não considerado'}`,
      `Férias vencidas: ${input.feriasVencidas ? 'consideradas' : 'não consideradas'}`,
      `Férias proporcionais: ${input.feriasProporcionais ? 'consideradas' : 'não consideradas'}`
    ],
    results: [
      { label: 'Saldo de salário', value: formatCentsToBRL(saldoSalario) },
      { label: 'Aviso prévio', value: formatCentsToBRL(avisoPrevio) },
      { label: '13º proporcional', value: formatCentsToBRL(decimoTerceiro) },
      { label: 'Férias vencidas + 1/3', value: formatCentsToBRL(feriasVencidas) },
      { label: 'Férias proporcionais + 1/3', value: formatCentsToBRL(feriasProporcionais) },
      { label: 'Multa FGTS', value: formatCentsToBRL(multaFgts) },
      { label: 'Total estimado', value: formatCentsToBRL(total) }
    ],
    warnings,
    raw: {
      saldoSalario,
      avisoPrevio,
      decimoTerceiro,
      feriasVencidas,
      feriasProporcionais,
      multaFgts,
      fgtsBase,
      total
    }
  };
};

export const calcPrazoProcessual = (input: {
  dataInicial: string;
  dias: number;
  tipo: 'uteis' | 'corridos';
  feriados: string;
}): CalcResult => {
  const holidays = new Set(input.feriados.split(/[,\n;]/).map((item) => item.trim()).filter(Boolean));
  const { endDate, warnings } = calculateDeadline(
    input.dataInicial,
    input.dias,
    input.tipo === 'uteis',
    holidays
  );
  return {
    title: 'Prazo Processual',
    inputs: [
      `Data inicial: ${formatDateBR(input.dataInicial)}`,
      `Dias: ${input.dias}`,
      `Tipo: ${input.tipo === 'uteis' ? 'Dias úteis' : 'Dias corridos'}`
    ],
    formula: 'Contagem sequencial conforme tipo de prazo',
    steps: [
      `Início: ${formatDateBR(input.dataInicial)}`,
      `Dias contados: ${input.dias}`,
      `Resultado: ${formatDateBR(endDate)}`
    ],
    results: [{ label: 'Data final', value: formatDateBR(endDate) }],
    warnings: [
      'Contagem considera o dia seguinte à data inicial.',
      ...warnings
    ],
    raw: { endDate }
  };
};

export const calcHonorarios = (input: {
  proveito: string;
  percentualHonorarios: string;
  percentualSucumbencia: string;
}): CalcResult => {
  const proveitoCents = Number(input.proveito);
  const honorariosDec = parsePercentToDecimal(input.percentualHonorarios);
  const sucumbenciaDec = parsePercentToDecimal(input.percentualSucumbencia);
  const honorariosCents = safeRoundCents(proveitoCents * honorariosDec);
  const sucumbenciaCents = safeRoundCents(proveitoCents * sucumbenciaDec);
  const totalCents = honorariosCents + sucumbenciaCents;
  return {
    title: 'Honorários',
    inputs: [
      `Proveito econômico: ${formatCentsToBRL(proveitoCents)}`,
      `Honorários: ${formatPercent(honorariosDec)}`,
      `Sucumbência: ${formatPercent(sucumbenciaDec)}`
    ],
    formula: 'Honorários = Base × % + Sucumbência',
    steps: [
      `Honorários: ${formatCentsToBRL(proveitoCents, false)} × ${honorariosDec.toFixed(6).replace('.', ',')}`,
      `Sucumbência: ${formatCentsToBRL(proveitoCents, false)} × ${sucumbenciaDec.toFixed(6).replace('.', ',')}`
    ],
    results: [
      { label: 'Honorários', value: formatCentsToBRL(honorariosCents) },
      { label: 'Sucumbência', value: formatCentsToBRL(sucumbenciaCents) },
      { label: 'Total', value: formatCentsToBRL(totalCents) }
    ],
    warnings: ['Estimativa sem considerar particularidades contratuais.'],
    raw: { proveitoCents, honorariosCents, sucumbenciaCents, totalCents }
  };
};

export const calcAposentadoria = (input: {
  idade: number;
  contribuicao: number;
  idadeMinima: number;
  contribuicaoMinima: number;
  regra: string;
}): CalcResult => {
  const elegivel =
    input.idade >= input.idadeMinima && input.contribuicao >= input.contribuicaoMinima;
  return {
    title: 'Aposentadoria (Simulação Básica)',
    inputs: [
      `Idade: ${input.idade} anos`,
      `Contribuição: ${input.contribuicao} anos`,
      `Regra: ${input.regra}`
    ],
    formula: 'Comparação com requisitos informados manualmente',
    steps: [
      `Idade mínima informada: ${input.idadeMinima} anos`,
      `Tempo mínimo informado: ${input.contribuicaoMinima} anos`,
      `Resultado: ${elegivel ? 'Requisitos atingidos' : 'Requisitos não atingidos'}`
    ],
    results: [{ label: 'Status', value: elegivel ? 'Elegível (estimativa)' : 'Não elegível (estimativa)' }],
    warnings: [
      'Simulação básica. Não substitui análise oficial do INSS.',
      'Requisitos usados são informados manualmente.'
    ],
    raw: { elegivel }
  };
};

export const calcRevisaoAtrasados = (input: {
  parcelas: string[];
  indice: string;
  juros: string;
}): CalcResult => {
  const parcelasCents = input.parcelas.map((valor) => Number(valor));
  const somaCents = parcelasCents.reduce((acc, value) => acc + value, 0);
  const indiceDec = parsePercentToDecimal(input.indice);
  const jurosDec = parsePercentToDecimal(input.juros);
  const corrigidoCents = safeRoundCents(somaCents * (1 + indiceDec));
  const comJurosCents = safeRoundCents(corrigidoCents * (1 + jurosDec));
  return {
    title: 'Revisão/Atrasados (Manual)',
    inputs: [
      `Parcelas: ${parcelasCents.length}`,
      `Índice: ${formatPercent(indiceDec)}`,
      `Juros: ${formatPercent(jurosDec)}`
    ],
    formula: 'Soma das parcelas + índice + juros (manual)',
    steps: [
      `Soma das parcelas: ${formatCentsToBRL(somaCents)}`,
      `Aplicar índice: ${formatPercent(indiceDec)}`,
      `Aplicar juros: ${formatPercent(jurosDec)}`
    ],
    results: [
      { label: 'Total parcelas', value: formatCentsToBRL(somaCents) },
      { label: 'Após índice', value: formatCentsToBRL(corrigidoCents) },
      { label: 'Após juros', value: formatCentsToBRL(comJurosCents) }
    ],
    warnings: ['Índices e juros informados manualmente.'],
    raw: { somaCents, corrigidoCents, comJurosCents }
  };
};
