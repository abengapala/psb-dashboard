import * as XLSX from 'xlsx';
import type { Data, EodBucket, EodReport, EodTotals } from '../types';

const TEAM_LABELS = new Set([
  'FRONTEND',
  'FRONT END',
  'MIDRANGE',
  'MID RANGE',
  'HARDCORE',
  'HARD CORE',
]);

const KNOWN_PHOTOS: Record<string, string> = {
  jhumir: 'photos/jhumir.png',
  'jhumir pena': 'photos/Jhumir Pena.png',
  'jhumir peña': 'photos/jhumir.png',
  polo: 'photos/polo.png',
  'polo savedra': 'photos/Polo Savedra.png',
  jaymark: 'photos/jaymark.png',
  'jaymark mosende': 'photos/Jaymark Mosende.png',
  aira: 'photos/aira.png',
  'aira borong': 'photos/Aira Borong.png',
  josafat: 'photos/josafat.png',
  'josafat galope': 'photos/Josafat Galope.png',
  eurie: 'photos/eurie.png',
  'eurie bastasa': 'photos/Eurie Bastasa.png',
  chelsea: 'photos/Chelsea.png',
  'chelsea sayson': 'photos/Chelsea Sayson.png',
  rodel: 'photos/rodel.png',
  'rodel hama': 'photos/Rodel Hama.png',
};

function cleanName(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).trim().replace(/\s+/g, ' ');
}

function numRaw(v: unknown): number | null {
  if (v === null || v === undefined || (typeof v === 'string' && !v.trim())) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).replace(/,/g, '').replace(/%/g, '').trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function numFix(v: unknown): number | null {
  if (v === null || v === undefined || (typeof v === 'string' && !v.trim())) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  let s = String(v).replace(/,/g, '').replace(/%/g, '').trim();
  const parts = s.split('.');
  if (parts.length > 2) {
    s = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function matchPhoto(name: string): string | null {
  const full = name.toLowerCase();
  const first = full.split(' ')[0] || '';
  return KNOWN_PHOTOS[first] || KNOWN_PHOTOS[full] || null;
}

function parseEod(wb: XLSX.WorkBook, ptpRows: unknown[][]): EodReport | undefined {
  const eodName = wb.SheetNames.find((n) => n.trim().toUpperCase().startsWith('EOD REPORT'));
  if (!eodName) return undefined;
  const ws = wb.Sheets[eodName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null, raw: true });
  const hi = rows.findIndex(
    (r) => Array.isArray(r) && cleanName(r[0]).toUpperCase() === 'BUCKET',
  );
  if (hi < 0) return undefined;

  const side = (off: number): EodBucket[] => {
    const out: EodBucket[] = [];
    for (const r of rows.slice(hi + 1)) {
      const b = cleanName(r?.[off]);
      if (!b) {
        if (out.length) break;
        continue;
      }
      if (b.toUpperCase().startsWith('GRAND TOTAL')) break;
      out.push({
        bucket: b.toUpperCase(),
        count: numFix(r?.[off + 1]) ?? 0,
        ac: Math.round((numFix(r?.[off + 2]) ?? 0) * 100) / 100,
        ob: Math.round((numFix(r?.[off + 3]) ?? 0) * 100) / 100,
      });
    }
    return out;
  };

  const ptp = side(0);
  const confirmed = side(4);

  // If CONFIRMED PAYMENT formulas are uncached (all 0), evaluate COUNTIFS/SUMIFS against PTP MONITORING 2026
  if (
    confirmed.length > 0 &&
    confirmed.every((x) => x.count === 0 && x.ac === 0 && x.ob === 0)
  ) {
    let sampleFormula = '';
    for (let rIdx = hi + 1; rIdx < Math.min(rows.length, hi + 10); rIdx++) {
      const cellAddr = XLSX.utils.encode_cell({ r: rIdx, c: 5 });
      const cell = ws[cellAddr];
      if (cell?.f) {
        sampleFormula = cell.f;
        break;
      }
    }
    if (sampleFormula) {
      const quotes = Array.from(sampleFormula.matchAll(/"([^"]+)"/g)).map((m) => m[1]);
      const monthQ = quotes.find((q) => q.includes('20') && !q.includes('/'))?.trim().toUpperCase();
      const dateQ = quotes.find((q) => q.includes('/') || q.includes('-'))?.trim();
      let targetMDY: [number, number, number] | null = null;
      if (dateQ) {
        const d = new Date(dateQ);
        if (!Number.isNaN(d.getTime())) {
          targetMDY = [d.getMonth() + 1, d.getDate(), d.getFullYear()];
        }
      }

      for (const item of confirmed) {
        const bNorm = item.bucket.replace(/\s+/g, '').toUpperCase();
        let cnt = 0;
        let ac = 0;
        let ob = 0;
        for (const pr of ptpRows.slice(1)) {
          if (!Array.isArray(pr) || pr.length <= 20) continue;
          const uVal = cleanName(pr[20]).toUpperCase().replace(/\s+/g, '');
          if (uVal !== bNorm) continue;
          if (monthQ && cleanName(pr[18]).toUpperCase() !== monthQ) continue;
          const oVal = pr[14];
          if (targetMDY) {
            let matchedDate = false;
            if (typeof oVal === 'number') {
              const parsed = XLSX.SSF.parse_date_code(oVal);
              if (
                parsed &&
                parsed.m === targetMDY[0] &&
                parsed.d === targetMDY[1] &&
                parsed.y === targetMDY[2]
              ) {
                matchedDate = true;
              }
            } else if (oVal instanceof Date) {
              if (
                oVal.getMonth() + 1 === targetMDY[0] &&
                oVal.getDate() === targetMDY[1] &&
                oVal.getFullYear() === targetMDY[2]
              ) {
                matchedDate = true;
              }
            } else if (cleanName(oVal) === dateQ) {
              matchedDate = true;
            }
            if (!matchedDate) continue;
          }
          cnt += 1;
          ac += numFix(pr[12]) ?? 0;
          ob += numFix(pr[15]) ?? 0;
        }
        item.count = cnt;
        item.ac = Math.round(ac * 100) / 100;
        item.ob = Math.round(ob * 100) / 100;
      }
    }
  }

  const totals = (items: EodBucket[]): EodTotals => ({
    count: Math.round(items.reduce((s, x) => s + x.count, 0)),
    ac: Math.round(items.reduce((s, x) => s + x.ac, 0) * 100) / 100,
    ob: Math.round(items.reduce((s, x) => s + x.ob, 0) * 100) / 100,
  });

  return {
    sheet: eodName,
    ptp,
    ptpTotal: totals(ptp),
    confirmed,
    confirmedTotal: totals(confirmed),
  };
}

export async function parseExcelFile(file: File): Promise<{ data: Data; summary: string }> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array', cellFormula: true });

  const ptpSheet = wb.Sheets['PTP MONITORING 2026'];
  const perfSheet = wb.Sheets['AGENTS PERFORMANCE'];
  if (!ptpSheet || !perfSheet) {
    throw new Error('Missing required sheets: "PTP MONITORING 2026" and/or "AGENTS PERFORMANCE".');
  }

  const ptp = XLSX.utils.sheet_to_json<unknown[]>(ptpSheet, { header: 1, defval: null, raw: true });
  const perf = XLSX.utils.sheet_to_json<unknown[]>(perfSheet, { header: 1, defval: null, raw: true });

  const sheetMonth = cleanName(perf[0]?.[1]).toUpperCase();
  const now = new Date();
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];
  const month = sheetMonth || `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  const targets = new Map<string, number>();
  for (const r of perf.slice(1)) {
    const name = cleanName(r?.[1]);
    if (!name) {
      if (targets.size > 0) break;
      continue;
    }
    if (TEAM_LABELS.has(name.toUpperCase()) || name.toUpperCase() === 'AGENT NAME') continue;
    const t = numRaw(r?.[2]);
    if (t && t > 0) targets.set(name, t);
  }

  if (targets.size === 0) {
    throw new Error('No agents/targets found in the AGENTS PERFORMANCE sheet.');
  }

  const hi = ptp
    .slice(0, 15)
    .findIndex(
      (r) =>
        Array.isArray(r) &&
        r.some((c) => cleanName(c).toUpperCase() === 'AGENT NAME'),
    );
  if (hi < 0) {
    throw new Error('Could not find the header row (AGENT NAME) in PTP MONITORING 2026.');
  }

  const col: Record<string, number> = {};
  (ptp[hi] || []).forEach((h, j) => {
    const k = cleanName(h).toUpperCase();
    if (k && !(k in col)) col[k] = j;
  });

  const need = ['AGENT NAME', 'ACCOUNT STATUS', 'STATUS', 'MONTH', 'CONFIRMED AMOUNT', 'OB'];
  const missing = need.filter((k) => !(k in col));
  if (missing.length > 0) {
    throw new Error(`Missing columns in PTP MONITORING 2026: ${missing.join(', ')}`);
  }

  const stats = new Map<
    string,
    { pay: number; payN: number; repo: number; repoN: number; obCured: number }
  >();
  const lower = new Map<string, string>();
  for (const n of targets.keys()) {
    stats.set(n, { pay: 0, payN: 0, repo: 0, repoN: 0, obCured: 0 });
    lower.set(n.toLowerCase(), n);
  }

  const warnings: string[] = [];
  const unknown = new Set<string>();
  const hasOkBp = 'OK / BP' in col;

  ptp.slice(hi + 1).forEach((r, idx) => {
    const xlRow = hi + 2 + idx;
    if (!Array.isArray(r)) return;
    if (cleanName(r[col['MONTH']]).toUpperCase() !== month) return;
    if (cleanName(r[col['ACCOUNT STATUS']]).toUpperCase() !== 'KEPT') return;
    if (hasOkBp && cleanName(r[col['OK / BP']]).toUpperCase() !== 'OK') return;

    const who = cleanName(r[col['AGENT NAME']]);
    if (!who) return;
    const key = lower.get(who.toLowerCase());
    if (!key) {
      unknown.add(who);
      return;
    }

    const rawAmt = r[col['CONFIRMED AMOUNT']];
    const strict = numRaw(rawAmt);
    const fixed = numFix(rawAmt);
    const s = stats.get(key)!;

    let amt = 0;
    if (strict === null) {
      if (fixed && fixed > 0) {
        warnings.push(
          `Row auto-fixed: '${String(rawAmt)}' → ${fixed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} for ${who} (Row ${xlRow})`,
        );
        amt = fixed;
      } else {
        warnings.push(
          `Row ${xlRow} (${who}): CONFIRMED AMOUNT '${String(rawAmt)}' is unreadable text — amount NOT counted.`,
        );
        if (cleanName(r[col['STATUS']]).toUpperCase() === 'VS') s.repoN += 1;
        return;
      }
    } else {
      amt = strict;
    }

    const ob = numFix(r[col['OB']]) ?? 0;
    if (cleanName(r[col['STATUS']]).toUpperCase() === 'VS') {
      s.repo += amt;
      s.repoN += 1;
    } else {
      s.pay += amt;
      s.payN += 1;
    }
    s.obCured += ob;
  });

  if (unknown.size > 0) {
    warnings.push(
      `KEPT rows found for agents not listed in AGENTS PERFORMANCE (ignored): ${Array.from(unknown).sort().join(', ')}`,
    );
  }

  const shortMonth = month.split(' ')[0];
  const agents = Array.from(targets.entries()).map(([name, target]) => {
    const s = stats.get(name)!;
    const finalPosted = s.pay + s.repo;
    return {
      name,
      month: shortMonth,
      finalPosted: Math.round(finalPosted * 100) / 100,
      target: Math.round(target * 100) / 100,
      pct: target ? Math.round((finalPosted / target) * 10000) / 100 : 0,
      obCured: Math.round(s.obCured * 100) / 100,
      repoPosted: Math.round(s.repo * 100) / 100,
      repoCount: s.repoN,
      photo: matchPhoto(name),
    };
  });

  const bankTarget = Math.round(Array.from(targets.values()).reduce((a, b) => a + b, 0) * 100) / 100;
  const posted = Math.round(agents.reduce((a, b) => a + b.finalPosted, 0) * 100) / 100;
  const repoPosted = Math.round(agents.reduce((a, b) => a + b.repoPosted, 0) * 100) / 100;
  const repoCount = agents.reduce((a, b) => a + b.repoCount, 0);
  const variance = Math.round((bankTarget - posted) * 100) / 100;
  const pctAchieved = bankTarget ? Math.round((posted / bankTarget) * 10000) / 100 : 0;

  const eod = parseEod(wb, ptp);
  const fileTime = new Date(file.lastModified || Date.now()).toISOString().slice(0, 19);
  const genTime = new Date().toISOString().slice(0, 19);

  const data: Data = {
    month,
    updatedAt: fileTime,
    generatedAt: genTime,
    kpi: {
      manpower: agents.length,
      bankTarget,
      posted,
      repoPosted,
      repoCount,
      variance,
      pctAchieved,
    },
    agents,
    warnings,
    eod,
  };

  const summary = `${month}: ${agents.length} agents, posted PHP ${Math.round(posted).toLocaleString('en-US')}, ${pctAchieved.toFixed(1)}% of target`;
  return { data, summary };
}
