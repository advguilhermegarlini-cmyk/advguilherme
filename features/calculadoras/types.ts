export type CalcResult = {
  title: string;
  inputs: string[];
  formula: string;
  steps: string[];
  results: { label: string; value: string }[];
  warnings: string[];
  raw: Record<string, unknown>;
};

export type SaveSimulationPayload = {
  userId: string;
  tipoCalculadora: string;
  payloadEntradas: Record<string, unknown>;
  resultado: Record<string, unknown>;
  criadoEm: string;
};
