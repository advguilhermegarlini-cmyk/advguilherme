import React, { useMemo, useState } from 'react';
import {
  calcAposentadoria,
  calcAtualizacaoIndice,
  calcHonorarios,
  calcJurosCompostos,
  calcJurosSimples,
  calcPrazoProcessual,
  calcRescisao,
  calcRevisaoAtrasados,
  formatMoneyInput,
  formatPercentInput,
  parseMoneyToCents,
  parsePercentToDecimal
} from '../domain';
import { getUserId, saveSimulation } from '../storage';
import type { CalcResult } from '../types';

type CalculatorMeta = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  component: React.FC;
};

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-2 text-sm text-[#c9d1d9]">
    <span className="uppercase tracking-widest text-[10px] text-[#8b949e]">{label}</span>
    {children}
    {error ? <span className="text-xs text-red-400">{error}</span> : null}
  </label>
);

const InputBase = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`bg-transparent border-b border-[#30363d] px-2 py-2 text-lg outline-none focus:border-gold transition-colors ${props.className || ''}`}
  />
);

const SelectBase = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`bg-transparent border-b border-[#30363d] px-2 py-2 text-lg outline-none focus:border-gold transition-colors ${props.className || ''}`}
  />
);

const TextareaBase = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`bg-transparent border border-[#30363d] px-3 py-3 text-sm outline-none focus:border-gold transition-colors ${props.className || ''}`}
  />
);

const ResultCard = ({ result, onCopy }: { result: CalcResult | null; onCopy: () => void }) => {
  if (!result) return null;
  return (
    <div className="mt-10 border border-[#30363d] bg-[#0d1117]/60 p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold">Estimativa</p>
          <h4 className="text-2xl font-light text-[#f0f6fc]">{result.title}</h4>
        </div>
        <button
          onClick={onCopy}
          className="text-[10px] uppercase tracking-[0.3em] text-gold border-b border-gold/60 pb-1 hover:text-[#f0f6fc] transition-colors font-semibold"
        >
          Copiar resumo
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6 text-sm text-[#c9d1d9]">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#8b949e]">Entradas</p>
          {result.inputs.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#8b949e]">Resultados</p>
          {result.results.map((item) => (
            <p key={item.label} className="flex items-center justify-between gap-6">
              <span>{item.label}</span>
              <span className="text-[#f0f6fc]">{item.value}</span>
            </p>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 text-sm text-[#c9d1d9]">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#8b949e]">Fórmula/Critério</p>
          <p>{result.formula}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#8b949e]">Memória de cálculo</p>
          {result.steps.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </div>
      {result.warnings.length > 0 && (
        <div className="border-t border-[#30363d] pt-4 text-xs text-[#8b949e] space-y-2">
          {result.warnings.map((warning) => (
            <p key={warning}>• {warning}</p>
          ))}
        </div>
      )}
    </div>
  );
};

const useCopySummary = (result: CalcResult | null) => {
  return () => {
    if (!result) return;
    const text = [
      `${result.title} - Estimativa`,
      '',
      'Entradas:',
      ...result.inputs.map((item) => `- ${item}`),
      '',
      `Fórmula/Critério: ${result.formula}`,
      '',
      'Memória de cálculo:',
      ...result.steps.map((item) => `- ${item}`),
      '',
      'Resultados:',
      ...result.results.map((item) => `- ${item.label}: ${item.value}`),
      '',
      'Observações:',
      ...result.warnings.map((item) => `- ${item}`)
    ].join('\n');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };
};

const useSaveIfEnabled = (
  enabled: boolean,
  tipoCalculadora: string,
  payloadEntradas: Record<string, unknown>,
  resultado: Record<string, unknown>
) => {
  if (!enabled) return;
  saveSimulation({
    userId: getUserId(),
    tipoCalculadora,
    payloadEntradas,
    resultado,
    criadoEm: new Date().toISOString(),
  });
};

const JurosSimplesCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState('');
  const [taxa, setTaxa] = useState('');
  const [taxaUnidade, setTaxaUnidade] = useState<'mensal' | 'anual'>('mensal');
  const [periodo, setPeriodo] = useState('1');
  const [periodoUnidade, setPeriodoUnidade] = useState<'dias' | 'meses' | 'anos'>('meses');
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);
  const copySummary = useCopySummary(result);

  const handleCalculate = () => {
    const nextErrors: Record<string, string> = {};
    const principalCents = parseMoneyToCents(principal);
    if (principalCents <= 0) nextErrors.principal = 'Informe um valor válido.';
    if (parsePercentToDecimal(taxa) <= 0) nextErrors.taxa = 'Informe a taxa.';
    if (Number(periodo) <= 0) nextErrors.periodo = 'Informe o período.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const next = calcJurosSimples({
      principal: String(principalCents),
      taxa,
      taxaUnidade,
      periodo: Number(periodo),
      periodoUnidade
    });
    setResult(next);
    useSaveIfEnabled(saveEnabled, 'juros_simples', { principal, taxa, taxaUnidade, periodo, periodoUnidade }, next.raw);
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Valor principal (R$)" error={errors.principal}>
          <InputBase value={principal} onChange={(e) => setPrincipal(formatMoneyInput(e.target.value))} placeholder="0,00" />
        </Field>
        <Field label="Taxa (%)" error={errors.taxa}>
          <InputBase value={taxa} onChange={(e) => setTaxa(formatPercentInput(e.target.value))} placeholder="0,00" />
        </Field>
        <Field label="Taxa por">
          <SelectBase value={taxaUnidade} onChange={(e) => setTaxaUnidade(e.target.value as 'mensal' | 'anual')}>
            <option value="mensal">Mês</option>
            <option value="anual">Ano</option>
          </SelectBase>
        </Field>
        <Field label="Período" error={errors.periodo}>
          <InputBase type="number" min={1} value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
        </Field>
        <Field label="Unidade do período">
          <SelectBase value={periodoUnidade} onChange={(e) => setPeriodoUnidade(e.target.value as 'dias' | 'meses' | 'anos')}>
            <option value="dias">Dias</option>
            <option value="meses">Meses</option>
            <option value="anos">Anos</option>
          </SelectBase>
        </Field>
        <Field label="Salvar simulação">
          <label className="flex items-center gap-3 text-sm text-[#c9d1d9]">
            <input type="checkbox" checked={saveEnabled} onChange={(e) => setSaveEnabled(e.target.checked)} />
            Salvar em histórico local
          </label>
        </Field>
      </div>
      <button
        onClick={handleCalculate}
        className="text-[10px] uppercase tracking-[0.4em] text-gold border border-gold px-14 py-4 hover:bg-gold hover:text-white transition-all font-bold"
      >
        Calcular
      </button>
      <ResultCard result={result} onCopy={copySummary} />
    </div>
  );
};

const JurosCompostosCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState('');
  const [taxa, setTaxa] = useState('');
  const [capitalizacao, setCapitalizacao] = useState<'mensal' | 'anual' | 'diaria'>('mensal');
  const [periodo, setPeriodo] = useState('1');
  const [periodoUnidade, setPeriodoUnidade] = useState<'dias' | 'meses' | 'anos'>('meses');
  const [baseDiaria, setBaseDiaria] = useState<360 | 365>(360);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);
  const copySummary = useCopySummary(result);

  const handleCalculate = () => {
    const nextErrors: Record<string, string> = {};
    const principalCents = parseMoneyToCents(principal);
    if (principalCents <= 0) nextErrors.principal = 'Informe um valor válido.';
    if (parsePercentToDecimal(taxa) <= 0) nextErrors.taxa = 'Informe a taxa.';
    if (Number(periodo) <= 0) nextErrors.periodo = 'Informe o período.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const next = calcJurosCompostos({
      principal: String(principalCents),
      taxa,
      capitalizacao,
      periodo: Number(periodo),
      periodoUnidade,
      baseDiaria
    });
    setResult(next);
    useSaveIfEnabled(saveEnabled, 'juros_compostos', { principal, taxa, capitalizacao, periodo, periodoUnidade, baseDiaria }, next.raw);
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Valor principal (R$)" error={errors.principal}>
          <InputBase value={principal} onChange={(e) => setPrincipal(formatMoneyInput(e.target.value))} placeholder="0,00" />
        </Field>
        <Field label="Taxa (%)" error={errors.taxa}>
          <InputBase value={taxa} onChange={(e) => setTaxa(formatPercentInput(e.target.value))} placeholder="0,00" />
        </Field>
        <Field label="Capitalização">
          <SelectBase value={capitalizacao} onChange={(e) => setCapitalizacao(e.target.value as 'mensal' | 'anual' | 'diaria')}>
            <option value="mensal">Mensal</option>
            <option value="anual">Anual</option>
            <option value="diaria">Diária</option>
          </SelectBase>
        </Field>
        {capitalizacao === 'diaria' && (
          <Field label="Base diária">
            <SelectBase value={baseDiaria} onChange={(e) => setBaseDiaria(Number(e.target.value) as 360 | 365)}>
              <option value={360}>360 (30/360)</option>
              <option value={365}>365</option>
            </SelectBase>
          </Field>
        )}
        <Field label="Período" error={errors.periodo}>
          <InputBase type="number" min={1} value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
        </Field>
        <Field label="Unidade do período">
          <SelectBase value={periodoUnidade} onChange={(e) => setPeriodoUnidade(e.target.value as 'dias' | 'meses' | 'anos')}>
            <option value="dias">Dias</option>
            <option value="meses">Meses</option>
            <option value="anos">Anos</option>
          </SelectBase>
        </Field>
        <Field label="Salvar simulação">
          <label className="flex items-center gap-3 text-sm text-[#c9d1d9]">
            <input type="checkbox" checked={saveEnabled} onChange={(e) => setSaveEnabled(e.target.checked)} />
            Salvar em histórico local
          </label>
        </Field>
      </div>
      <button
        onClick={handleCalculate}
        className="text-[10px] uppercase tracking-[0.4em] text-gold border border-gold px-14 py-4 hover:bg-gold hover:text-white transition-all font-bold"
      >
        Calcular
      </button>
      <ResultCard result={result} onCopy={copySummary} />
    </div>
  );
};

const AtualizacaoIndiceCalculator: React.FC = () => {
  const [valorInicial, setValorInicial] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [indice, setIndice] = useState('IPCA (manual)');
  const [percentual, setPercentual] = useState('');
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);
  const copySummary = useCopySummary(result);

  const handleCalculate = () => {
    const nextErrors: Record<string, string> = {};
    const valorCents = parseMoneyToCents(valorInicial);
    if (valorCents <= 0) nextErrors.valorInicial = 'Informe um valor válido.';
    if (!dataInicial) nextErrors.dataInicial = 'Informe a data inicial.';
    if (!dataFinal) nextErrors.dataFinal = 'Informe a data final.';
    if (parsePercentToDecimal(percentual) <= 0) nextErrors.percentual = 'Informe o índice.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const next = calcAtualizacaoIndice({
      valorInicial: String(valorCents),
      dataInicial,
      dataFinal,
      indiceNome: indice,
      percentualManual: percentual
    });
    setResult(next);
    useSaveIfEnabled(saveEnabled, 'atualizacao_indice', { valorInicial, dataInicial, dataFinal, indice, percentual }, next.raw);
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Valor inicial (R$)" error={errors.valorInicial}>
          <InputBase value={valorInicial} onChange={(e) => setValorInicial(formatMoneyInput(e.target.value))} placeholder="0,00" />
        </Field>
        <Field label="Índice (manual)" error={errors.percentual}>
          <InputBase value={percentual} onChange={(e) => setPercentual(formatPercentInput(e.target.value))} placeholder="0,00" />
        </Field>
        <Field label="Data inicial" error={errors.dataInicial}>
          <InputBase type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
        </Field>
        <Field label="Data final" error={errors.dataFinal}>
          <InputBase type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />
        </Field>
        <Field label="Nome do índice (informativo)">
          <InputBase value={indice} onChange={(e) => setIndice(e.target.value)} />
        </Field>
        <Field label="Salvar simulação">
          <label className="flex items-center gap-3 text-sm text-[#c9d1d9]">
            <input type="checkbox" checked={saveEnabled} onChange={(e) => setSaveEnabled(e.target.checked)} />
            Salvar em histórico local
          </label>
        </Field>
      </div>
      <button
        onClick={handleCalculate}
        className="text-[10px] uppercase tracking-[0.4em] text-gold border border-gold px-14 py-4 hover:bg-gold hover:text-white transition-all font-bold"
      >
        Calcular
      </button>
      <ResultCard result={result} onCopy={copySummary} />
    </div>
  );
};

const RescisaoCalculator: React.FC = () => {
  const [salario, setSalario] = useState('');
  const [admissao, setAdmissao] = useState('');
  const [desligamento, setDesligamento] = useState('');
  const [tipo, setTipo] = useState<'pedido' | 'sem_justa' | 'justa' | 'acordo'>('sem_justa');
  const [aviso, setAviso] = useState<'indenizado' | 'trabalhado' | 'nao_aplicavel'>('indenizado');
  const [feriasVencidas, setFeriasVencidas] = useState(false);
  const [feriasProporcionais, setFeriasProporcionais] = useState(true);
  const [decimoTerceiro, setDecimoTerceiro] = useState(true);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);
  const copySummary = useCopySummary(result);

  const handleCalculate = () => {
    const nextErrors: Record<string, string> = {};
    const salarioCents = parseMoneyToCents(salario);
    if (salarioCents <= 0) nextErrors.salario = 'Informe o salário.';
    if (!admissao) nextErrors.admissao = 'Informe a admissão.';
    if (!desligamento) nextErrors.desligamento = 'Informe o desligamento.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const next = calcRescisao({
      salario: String(salarioCents),
      admissao,
      desligamento,
      tipo,
      aviso,
      feriasVencidas,
      feriasProporcionais,
      decimoTerceiro
    });
    setResult(next);
    useSaveIfEnabled(
      saveEnabled,
      'rescisao_trabalhista',
      { salario, admissao, desligamento, tipo, aviso, feriasVencidas, feriasProporcionais, decimoTerceiro },
      next.raw
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Salário base (R$)" error={errors.salario}>
          <InputBase value={salario} onChange={(e) => setSalario(formatMoneyInput(e.target.value))} placeholder="0,00" />
        </Field>
        <Field label="Data de admissão" error={errors.admissao}>
          <InputBase type="date" value={admissao} onChange={(e) => setAdmissao(e.target.value)} />
        </Field>
        <Field label="Data de desligamento" error={errors.desligamento}>
          <InputBase type="date" value={desligamento} onChange={(e) => setDesligamento(e.target.value)} />
        </Field>
        <Field label="Tipo de rescisão">
          <SelectBase value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)}>
            <option value="pedido">Pedido de demissão</option>
            <option value="sem_justa">Dispensa sem justa causa</option>
            <option value="justa">Dispensa por justa causa</option>
            <option value="acordo">Rescisão por acordo (484-A)</option>
          </SelectBase>
        </Field>
        <Field label="Aviso prévio">
          <SelectBase value={aviso} onChange={(e) => setAviso(e.target.value as typeof aviso)}>
            <option value="indenizado">Indenizado</option>
            <option value="trabalhado">Trabalhado</option>
            <option value="nao_aplicavel">Não aplicável</option>
          </SelectBase>
        </Field>
        <Field label="Férias vencidas">
          <label className="flex items-center gap-3 text-sm text-[#c9d1d9]">
            <input type="checkbox" checked={feriasVencidas} onChange={(e) => setFeriasVencidas(e.target.checked)} />
            Considerar férias vencidas + 1/3
          </label>
        </Field>
        <Field label="Férias proporcionais">
          <label className="flex items-center gap-3 text-sm text-[#c9d1d9]">
            <input type="checkbox" checked={feriasProporcionais} onChange={(e) => setFeriasProporcionais(e.target.checked)} />
            Considerar férias proporcionais + 1/3
          </label>
        </Field>
        <Field label="13º proporcional">
          <label className="flex items-center gap-3 text-sm text-[#c9d1d9]">
            <input type="checkbox" checked={decimoTerceiro} onChange={(e) => setDecimoTerceiro(e.target.checked)} />
            Considerar 13º proporcional
          </label>
        </Field>
        <Field label="Salvar simulação">
          <label className="flex items-center gap-3 text-sm text-[#c9d1d9]">
            <input type="checkbox" checked={saveEnabled} onChange={(e) => setSaveEnabled(e.target.checked)} />
            Salvar em histórico local
          </label>
        </Field>
      </div>
      <button
        onClick={handleCalculate}
        className="text-[10px] uppercase tracking-[0.4em] text-gold border border-gold px-14 py-4 hover:bg-gold hover:text-white transition-all font-bold"
      >
        Calcular
      </button>
      <ResultCard result={result} onCopy={copySummary} />
    </div>
  );
};

const PrazoProcessualCalculator: React.FC = () => {
  const [dataInicial, setDataInicial] = useState('');
  const [dias, setDias] = useState('1');
  const [tipo, setTipo] = useState<'uteis' | 'corridos'>('uteis');
  const [feriados, setFeriados] = useState('');
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);
  const copySummary = useCopySummary(result);

  const handleCalculate = () => {
    const nextErrors: Record<string, string> = {};
    if (!dataInicial) nextErrors.dataInicial = 'Informe a data inicial.';
    if (Number(dias) <= 0) nextErrors.dias = 'Informe o número de dias.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const next = calcPrazoProcessual({
      dataInicial,
      dias: Number(dias),
      tipo,
      feriados
    });
    setResult(next);
    useSaveIfEnabled(saveEnabled, 'prazo_processual', { dataInicial, dias, tipo, feriados }, next.raw);
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Data inicial" error={errors.dataInicial}>
          <InputBase type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
        </Field>
        <Field label="Dias" error={errors.dias}>
          <InputBase type="number" min={1} value={dias} onChange={(e) => setDias(e.target.value)} />
        </Field>
        <Field label="Tipo de contagem">
          <SelectBase value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)}>
            <option value="uteis">Dias úteis</option>
            <option value="corridos">Dias corridos</option>
          </SelectBase>
        </Field>
        <Field label="Feriados manuais (aaaa-mm-dd)">
          <TextareaBase
            rows={3}
            value={feriados}
            onChange={(e) => setFeriados(e.target.value)}
            placeholder="2026-01-01, 2026-02-13"
          />
        </Field>
        <Field label="Salvar simulação">
          <label className="flex items-center gap-3 text-sm text-[#c9d1d9]">
            <input type="checkbox" checked={saveEnabled} onChange={(e) => setSaveEnabled(e.target.checked)} />
            Salvar em histórico local
          </label>
        </Field>
      </div>
      <button
        onClick={handleCalculate}
        className="text-[10px] uppercase tracking-[0.4em] text-gold border border-gold px-14 py-4 hover:bg-gold hover:text-white transition-all font-bold"
      >
        Calcular
      </button>
      <ResultCard result={result} onCopy={copySummary} />
    </div>
  );
};

const HonorariosCalculator: React.FC = () => {
  const [proveito, setProveito] = useState('');
  const [honorarios, setHonorarios] = useState('');
  const [sucumbencia, setSucumbencia] = useState('');
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);
  const copySummary = useCopySummary(result);

  const handleCalculate = () => {
    const nextErrors: Record<string, string> = {};
    const proveitoCents = parseMoneyToCents(proveito);
    if (proveitoCents <= 0) nextErrors.proveito = 'Informe o valor.';
    if (parsePercentToDecimal(honorarios) <= 0) nextErrors.honorarios = 'Informe a taxa.';
    if (parsePercentToDecimal(sucumbencia) < 0) nextErrors.sucumbencia = 'Informe a taxa.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const next = calcHonorarios({
      proveito: String(proveitoCents),
      percentualHonorarios: honorarios,
      percentualSucumbencia: sucumbencia || '0'
    });
    setResult(next);
    useSaveIfEnabled(saveEnabled, 'honorarios', { proveito, honorarios, sucumbencia }, next.raw);
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Proveito econômico (R$)" error={errors.proveito}>
          <InputBase value={proveito} onChange={(e) => setProveito(formatMoneyInput(e.target.value))} placeholder="0,00" />
        </Field>
        <Field label="Honorários (%)" error={errors.honorarios}>
          <InputBase value={honorarios} onChange={(e) => setHonorarios(formatPercentInput(e.target.value))} placeholder="0,00" />
        </Field>
        <Field label="Sucumbência (%)" error={errors.sucumbencia}>
          <InputBase value={sucumbencia} onChange={(e) => setSucumbencia(formatPercentInput(e.target.value))} placeholder="0,00" />
        </Field>
        <Field label="Salvar simulação">
          <label className="flex items-center gap-3 text-sm text-[#c9d1d9]">
            <input type="checkbox" checked={saveEnabled} onChange={(e) => setSaveEnabled(e.target.checked)} />
            Salvar em histórico local
          </label>
        </Field>
      </div>
      <button
        onClick={handleCalculate}
        className="text-[10px] uppercase tracking-[0.4em] text-gold border border-gold px-14 py-4 hover:bg-gold hover:text-white transition-all font-bold"
      >
        Calcular
      </button>
      <ResultCard result={result} onCopy={copySummary} />
    </div>
  );
};

const AposentadoriaCalculator: React.FC = () => {
  const [idade, setIdade] = useState('0');
  const [contribuicao, setContribuicao] = useState('0');
  const [idadeMinima, setIdadeMinima] = useState('0');
  const [contribuicaoMinima, setContribuicaoMinima] = useState('0');
  const [regra, setRegra] = useState('Regra personalizada');
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);
  const copySummary = useCopySummary(result);

  const handleCalculate = () => {
    const nextErrors: Record<string, string> = {};
    if (Number(idade) <= 0) nextErrors.idade = 'Informe a idade.';
    if (Number(contribuicao) < 0) nextErrors.contribuicao = 'Informe a contribuição.';
    if (Number(idadeMinima) <= 0) nextErrors.idadeMinima = 'Informe a idade mínima.';
    if (Number(contribuicaoMinima) < 0) nextErrors.contribuicaoMinima = 'Informe o tempo mínimo.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const next = calcAposentadoria({
      idade: Number(idade),
      contribuicao: Number(contribuicao),
      idadeMinima: Number(idadeMinima),
      contribuicaoMinima: Number(contribuicaoMinima),
      regra
    });
    setResult(next);
    useSaveIfEnabled(saveEnabled, 'aposentadoria', { idade, contribuicao, idadeMinima, contribuicaoMinima, regra }, next.raw);
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Idade (anos)" error={errors.idade}>
          <InputBase type="number" min={0} value={idade} onChange={(e) => setIdade(e.target.value)} />
        </Field>
        <Field label="Tempo de contribuição (anos)" error={errors.contribuicao}>
          <InputBase type="number" min={0} value={contribuicao} onChange={(e) => setContribuicao(e.target.value)} />
        </Field>
        <Field label="Regra (informativa)">
          <InputBase value={regra} onChange={(e) => setRegra(e.target.value)} />
        </Field>
        <Field label="Idade mínima (manual)" error={errors.idadeMinima}>
          <InputBase type="number" min={0} value={idadeMinima} onChange={(e) => setIdadeMinima(e.target.value)} />
        </Field>
        <Field label="Tempo mínimo (manual)" error={errors.contribuicaoMinima}>
          <InputBase type="number" min={0} value={contribuicaoMinima} onChange={(e) => setContribuicaoMinima(e.target.value)} />
        </Field>
        <Field label="Salvar simulação">
          <label className="flex items-center gap-3 text-sm text-[#c9d1d9]">
            <input type="checkbox" checked={saveEnabled} onChange={(e) => setSaveEnabled(e.target.checked)} />
            Salvar em histórico local
          </label>
        </Field>
      </div>
      <button
        onClick={handleCalculate}
        className="text-[10px] uppercase tracking-[0.4em] text-gold border border-gold px-14 py-4 hover:bg-gold hover:text-white transition-all font-bold"
      >
        Calcular
      </button>
      <ResultCard result={result} onCopy={copySummary} />
    </div>
  );
};

const RevisaoAtrasadosCalculator: React.FC = () => {
  const [parcelas, setParcelas] = useState<string[]>(['']);
  const [indice, setIndice] = useState('');
  const [juros, setJuros] = useState('');
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);
  const copySummary = useCopySummary(result);

  const handleAddParcel = () => setParcelas((prev) => [...prev, '']);
  const handleRemoveParcel = (index: number) =>
    setParcelas((prev) => prev.filter((_, i) => i !== index));

  const handleCalculate = () => {
    const nextErrors: Record<string, string> = {};
    const parsed = parcelas.map(parseMoneyToCents).filter((value) => value > 0);
    if (parsed.length === 0) nextErrors.parcelas = 'Informe ao menos uma parcela.';
    if (parsePercentToDecimal(indice) < 0) nextErrors.indice = 'Informe o índice.';
    if (parsePercentToDecimal(juros) < 0) nextErrors.juros = 'Informe os juros.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const payload = parcelas.map((item) => String(parseMoneyToCents(item)));
    const next = calcRevisaoAtrasados({
      parcelas: payload,
      indice: indice || '0',
      juros: juros || '0'
    });
    setResult(next);
    useSaveIfEnabled(saveEnabled, 'revisao_atrasados', { parcelas, indice, juros }, next.raw);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-[#8b949e]">Parcelas (R$)</p>
        {parcelas.map((valor, index) => (
          <div key={`parcela-${index}`} className="flex gap-4 items-center">
            <InputBase
              value={valor}
              onChange={(e) =>
                setParcelas((prev) => prev.map((item, i) => (i === index ? formatMoneyInput(e.target.value) : item)))
              }
              placeholder="0,00"
              className="flex-1"
            />
            {parcelas.length > 1 && (
              <button
                onClick={() => handleRemoveParcel(index)}
                className="text-xs uppercase tracking-widest text-red-400"
                type="button"
              >
                Remover
              </button>
            )}
          </div>
        ))}
        {errors.parcelas ? <span className="text-xs text-red-400">{errors.parcelas}</span> : null}
        <button
          onClick={handleAddParcel}
          className="text-[10px] uppercase tracking-[0.3em] text-gold border-b border-gold/60 pb-1 hover:text-[#f0f6fc] transition-colors font-semibold"
          type="button"
        >
          Adicionar parcela
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Índice manual (%)" error={errors.indice}>
          <InputBase value={indice} onChange={(e) => setIndice(formatPercentInput(e.target.value))} placeholder="0,00" />
        </Field>
        <Field label="Juros manual (%)" error={errors.juros}>
          <InputBase value={juros} onChange={(e) => setJuros(formatPercentInput(e.target.value))} placeholder="0,00" />
        </Field>
        <Field label="Salvar simulação">
          <label className="flex items-center gap-3 text-sm text-[#c9d1d9]">
            <input type="checkbox" checked={saveEnabled} onChange={(e) => setSaveEnabled(e.target.checked)} />
            Salvar em histórico local
          </label>
        </Field>
      </div>
      <button
        onClick={handleCalculate}
        className="text-[10px] uppercase tracking-[0.4em] text-gold border border-gold px-14 py-4 hover:bg-gold hover:text-white transition-all font-bold"
      >
        Calcular
      </button>
      <ResultCard result={result} onCopy={copySummary} />
    </div>
  );
};

const categories = [
  {
    id: 'financeiras',
    title: 'Financeiras',
    description: 'Juros, correção e índices manuais.'
  },
  {
    id: 'trabalhistas',
    title: 'Trabalhistas',
    description: 'Cálculos de rescisão e estimativas.'
  },

];

const calculators: CalculatorMeta[] = [
  {
    id: 'juros-simples',
    title: 'Juros Simples',
    description: 'Calcule juros de forma linear.',
    categoryId: 'financeiras',
    component: JurosSimplesCalculator
  },
  {
    id: 'juros-compostos',
    title: 'Juros Compostos',
    description: 'Calcule montante e juros compostos.',
    categoryId: 'financeiras',
    component: JurosCompostosCalculator
  },
  {
    id: 'atualizacao-indice',
    title: 'Atualização por Índice',
    description: 'Atualize valores com índice manual.',
    categoryId: 'financeiras',
    component: AtualizacaoIndiceCalculator
  },
  {
    id: 'rescisao-trabalhista',
    title: 'Rescisão Trabalhista',
    description: 'Estimativa de verbas rescisórias.',
    categoryId: 'trabalhistas',
    component: RescisaoCalculator
  },

];

const CalculadorasSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('financeiras');
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);

  const calculatorsByCategory = useMemo(
    () => calculators.filter((calc) => calc.categoryId === activeCategory),
    [activeCategory]
  );

  React.useEffect(() => {
    setActiveCalculator(calculatorsByCategory[0]?.id ?? null);
  }, [calculatorsByCategory]);

  const selectedCalculator = calculators.find((calc) => calc.id === activeCalculator);
  const SelectedComponent = selectedCalculator?.component || null;

  return (
    <section id="calculadoras" className="py-32 bg-[#161b22]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-[#f0f6fc]">Calculadoras</h2>
            <p className="text-[#8b949e] font-light leading-relaxed">
              Ferramentas jurídicas e financeiras para simulações rápidas e auditáveis.
            </p>
          </div>
          <div className="h-[1px] flex-grow bg-[#30363d] mx-12 hidden md:block mb-6"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
              }}
              className={`border px-6 py-6 text-left transition-all ${
                activeCategory === category.id
                  ? 'border-gold bg-[#0d1117]'
                  : 'border-[#30363d] bg-[#0d1117]/40 hover:bg-[#0d1117]'
              }`}
            >
              <h3 className="text-lg font-light text-[#f0f6fc] mb-2">{category.title}</h3>
              <p className="text-xs text-[#8b949e]">{category.description}</p>
            </button>
          ))}
        </div>

        {SelectedComponent && (
          <div className="border border-[#30363d] bg-[#0d1117]/40 p-10">
            <div className="flex items-center justify-between flex-wrap gap-6 mb-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-gold">Calculadora</p>
                <h3 className="text-3xl font-light text-[#f0f6fc]">{selectedCalculator?.title}</h3>
                <p className="text-sm text-[#8b949e] mt-2">{selectedCalculator?.description}</p>
              </div>
            </div>
            <SelectedComponent />
          </div>
        )}
      </div>
    </section>
  );
};

export default CalculadorasSection;

