import React, { useMemo, useState } from 'react';
import { calcRescisao, formatMoneyInput, parseMoneyToCents } from '../domain';
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
    className={`bg-transparent border-b border-[#30363d] px-2 py-2 text-base sm:text-lg outline-none focus:border-gold transition-colors ${props.className || ''}`}
  />
);

const SelectBase = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`bg-transparent border-b border-[#30363d] px-2 py-2 text-base sm:text-lg outline-none focus:border-gold transition-colors ${props.className || ''}`}
  />
);

const ResultCard = ({ result, onCopy }: { result: CalcResult | null; onCopy: () => void }) => {
  if (!result) return null;
  return (
    <div className="mt-10 border border-[#30363d] bg-[#0d1117]/60 p-6 sm:p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold">Estimativa</p>
          <h4 className="text-xl sm:text-2xl font-light text-[#f0f6fc]">{result.title}</h4>
        </div>
        <button
          onClick={onCopy}
          className="text-[10px] uppercase tracking-[0.3em] text-gold border-b border-gold/60 pb-1 hover:text-[#f0f6fc] transition-colors font-semibold"
        >
          Copiar resumo
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 text-sm text-[#c9d1d9]">
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
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 text-sm text-[#c9d1d9]">
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
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
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
        className="text-[10px] uppercase tracking-[0.4em] text-gold border border-gold px-14 py-4 hover:bg-gold hover:text-white transition-all font-bold w-full sm:w-auto"
      >
        Calcular
      </button>
      <ResultCard result={result} onCopy={copySummary} />
    </div>
  );
};

const categories = [
  {
    id: 'trabalhistas',
    title: 'Trabalhistas',
    description: 'Cálculos de rescisão e estimativas.'
  },
];

const calculators: CalculatorMeta[] = [
  {
    id: 'rescisao-trabalhista',
    title: 'Rescisão Trabalhista',
    description: 'Estimativa de verbas rescisórias.',
    categoryId: 'trabalhistas',
    component: RescisaoCalculator
  },
];

const CalculadorasSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('trabalhistas');
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
    <section id="calculadoras" className="py-20 sm:py-28 lg:py-32 bg-[#161b22]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-8 text-center md:text-left">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-6 text-[#f0f6fc]">Calculadoras</h2>
            <p className="text-[#8b949e] font-light leading-relaxed">
              Ferramentas trabalhistas para simulações rápidas e auditáveis.
            </p>
          </div>
          <div className="h-[1px] flex-grow bg-[#30363d] mx-0 sm:mx-12 hidden md:block mb-6"></div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
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
          <div className="border border-[#30363d] bg-[#0d1117]/40 p-6 sm:p-10">
            <div className="flex items-center justify-between flex-wrap gap-6 mb-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-gold">Calculadora</p>
                <h3 className="text-2xl sm:text-3xl font-light text-[#f0f6fc]">{selectedCalculator?.title}</h3>
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

