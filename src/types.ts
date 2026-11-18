export type Agent = {
  name: string;
  month: string;
  finalPosted: number;
  target: number;
  pct: number;
  obCured: number;
  obTarget?: number;
  obPct?: number;
  repoPosted: number;
  repoCount: number;
  photo: string | null;
};

export type KPI = {
  manpower: number;
  bankTarget: number;
  posted: number;
  repoPosted: number;
  repoCount: number;
  variance: number;
  pctAchieved: number;
  obTargetTotal?: number;
  obCuredTotal?: number;
  obVariance?: number;
  obPctAchieved?: number;
};

export type EodBucket = {
  bucket: string;
  count: number;
  ac: number;
  ob: number;
};

export type EodTotals = {
  count: number;
  ac: number;
  ob: number;
};

export type EodReport = {
  sheet?: string;
  ptp: EodBucket[];
  ptpTotal: EodTotals;
  confirmed: EodBucket[];
  confirmedTotal: EodTotals;
};

export type FieldAreaStat = {
  area: string;
  total: number;
  positive: number;
  pos: number;
  ptp: number;
  repo: number;
  neg: number;
  ob: number;
};

export type FieldAgentStat = {
  tag: string;
  name: string;
  total: number;
  positive: number;
  pos: number;
  ptp: number;
  repo: number;
  neg: number;
  ob: number;
  photo: string | null;
};

export type FieldReport = {
  asOf: string;
  total: number;
  positive: number;
  pos: number;
  ptp: number;
  repo: number;
  neg: number;
  positiveRate: number;
  totalOb: number;
  areas: FieldAreaStat[];
  agents: FieldAgentStat[];
};

export type Data = {
  month: string;
  updatedAt: string;
  generatedAt: string;
  kpi: KPI;
  agents: Agent[];
  warnings: string[];
  eod?: EodReport;
  field?: FieldReport;
};
