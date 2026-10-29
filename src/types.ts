export type Agent = {
  name: string;
  month: string;
  finalPosted: number;
  target: number;
  pct: number;
  obCured: number;
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

export type Data = {
  month: string;
  updatedAt: string;
  generatedAt: string;
  kpi: KPI;
  agents: Agent[];
  warnings: string[];
  eod?: EodReport;
};
