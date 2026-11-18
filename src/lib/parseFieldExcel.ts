import * as XLSX from 'xlsx';
import type { FieldAgentStat, FieldAreaStat, FieldReport } from '../types';

const TAG_TO_AGENT: Record<string, { name: string; photo: string }> = {
  CSAYSON: { name: 'Chelsea Sayson', photo: 'photos/Chelsea.png' },
  ABORONG: { name: 'Aira Borong', photo: 'photos/aira.png' },
  JSPENA: { name: 'Jhumir Peña', photo: 'photos/jhumir.png' },
  EBASTASA: { name: 'Eurie Bastasa', photo: 'photos/eurie.png' },
  CJBCRUZ: { name: 'Charles Cruz', photo: 'photos/charles.png' },
  PSAVEDRA: { name: 'Polo Savedra', photo: 'photos/polo.png' },
  RHAMA: { name: 'Rodel Hama', photo: 'photos/rodel.png' },
  JMOSENDE: { name: 'Jaymark Mosende', photo: 'photos/jaymark.png' },
  JGALOPE: { name: 'Josafat Galope', photo: 'photos/josafat.png' },
};

function resolveFieldAgent(raw: string): { key: string; name: string; photo: string | null } {
  const u = raw.trim().toUpperCase();
  if (!u || u === 'N/A' || u === 'NO AGENT' || u === 'NONE') {
    return { key: 'UNASSIGNED', name: 'Unassigned', photo: null };
  }
  if (u === 'BCRM') {
    return { key: 'BCRM', name: 'BCRM', photo: null };
  }
  if (TAG_TO_AGENT[u]) {
    return { key: u, ...TAG_TO_AGENT[u] };
  }
  if (u.includes('CHELSEA') || u.includes('SAYSON')) {
    return { key: 'CSAYSON', ...TAG_TO_AGENT.CSAYSON };
  }
  if (u.includes('JHUMIR') || u.includes('JUMIR') || u.includes('NHUMIR') || u.includes('HUMOR') || u.includes('PENA') || u.includes('PEÑA')) {
    return { key: 'JSPENA', ...TAG_TO_AGENT.JSPENA };
  }
  if (u.includes('POLO') || u.includes('SAVEDRA')) {
    return { key: 'PSAVEDRA', ...TAG_TO_AGENT.PSAVEDRA };
  }
  if (u.includes('AIRA') || u.includes('BORONG')) {
    return { key: 'ABORONG', ...TAG_TO_AGENT.ABORONG };
  }
  if (u.includes('CHARLES') || u.includes('CRUZ')) {
    return { key: 'CJBCRUZ', ...TAG_TO_AGENT.CJBCRUZ };
  }
  if (u.includes('EURIE') || u.includes('EURE') || u.includes('BASTASA')) {
    return { key: 'EBASTASA', ...TAG_TO_AGENT.EBASTASA };
  }
  if (u.includes('RODEL') || u.includes('HAMA')) {
    return { key: 'RHAMA', ...TAG_TO_AGENT.RHAMA };
  }
  if (u.includes('JAYMARK') || u.includes('MOSENDE')) {
    return { key: 'JMOSENDE', ...TAG_TO_AGENT.JMOSENDE };
  }
  if (u.includes('JOSAFAT') || u.includes('GALOPE')) {
    return { key: 'JGALOPE', ...TAG_TO_AGENT.JGALOPE };
  }
  return { key: u, name: raw.trim(), photo: null };
}

function clean(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).trim().replace(/\s+/g, ' ');
}

function num(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const s = String(v ?? '').replace(/,/g, '').trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function classifyResult(raw: string): 'POS' | 'PTP' | 'REPO' | 'NEG' | 'CANCEL' | null {
  const u = raw.trim().toUpperCase();
  if (!u) return null;
  if (u.includes('CANCEL')) return 'CANCEL';
  if (u.includes('REPO') || u === 'VS' || u.includes('SURRENDER')) return 'REPO';
  if (u.includes('PTP')) return 'PTP';
  if (u === 'POS' || u.includes('POSITIVE')) return 'POS';
  if (u === 'NEG' || u.includes('NEGATIVE')) return 'NEG';
  return null;
}

function formatExcelDate(v: unknown): string | null {
  if (typeof v === 'number' && v > 20000) {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) {
      return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
    }
  } else if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  } else if (typeof v === 'string' && v.trim()) {
    const d = new Date(v.trim());
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return null;
}

export async function parseFieldExcelFile(
  file: File,
): Promise<{ field: FieldReport; summary: string }> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });

  const sheetName =
    wb.SheetNames.find((n) => n.trim().toUpperCase() === 'NOT CANCEL') ||
    wb.SheetNames.find((n) => n.trim().toUpperCase().includes('RESULT')) ||
    wb.SheetNames[0];

  if (!sheetName) {
    throw new Error('No worksheet found in this Field Result Excel file.');
  }

  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null, raw: true });

  const hi = rows.slice(0, 15).findIndex((r) => {
    if (!Array.isArray(r)) return false;
    const upper = r.map((c) => clean(c).toUpperCase());
    return upper.includes('AREA') && (upper.some((h) => h.includes('FV RESULT')) || upper.includes('STATUS'));
  });

  if (hi < 0) {
    throw new Error(
      'Could not find AREA and FV RESULT / STATUS columns in the Field Result sheet.',
    );
  }

  const hdr = (rows[hi] || []).map((c) => clean(c).toUpperCase());
  const colAgent =
    hdr.findIndex((h) => h.includes('AGENT')) >= 0
      ? hdr.findIndex((h) => h.includes('AGENT'))
      : hdr.findIndex((h) => h === 'REPORT TO' || h.includes('OFFICER'));
  const colArea =
    hdr.findIndex((h) => h === 'AUTOFIELD AREA') >= 0
      ? hdr.findIndex((h) => h === 'AUTOFIELD AREA')
      : hdr.findIndex((h) => h === 'AREA' || h.includes('AREA'));
  const colBank = hdr.findIndex((h) => h === 'BANK');
  const colNewBank = hdr.findIndex((h) => h === 'NEW BANK NAME');
  const colOb = hdr.findIndex((h) => h === 'OB' || h.includes('OUTSTANDING'));
  const colDate = hdr.findIndex((h) => h.includes('FV RESULT DATE') || h === 'DATE');
  const colAcct = hdr.findIndex((h) => h.includes('ACCOUNT NUMBER') || h === 'ACCOUNT');
  const colAddrRes =
    hdr.findIndex((h) => h.includes('ADDRESS') && h.includes('FV RESULT')) >= 0
      ? hdr.findIndex((h) => h.includes('ADDRESS') && h.includes('FV RESULT'))
      : hdr.findIndex((h) => h === 'STATUS' || h.includes('FV RESULT'));

  let acctMap: Record<string, string> = {};
  try {
    const rawMap = localStorage.getItem('psb_acct_agent_map');
    if (rawMap) acctMap = JSON.parse(rawMap) as Record<string, string>;
  } catch {
    acctMap = {};
  }

  const areaMap = new Map<string, FieldAreaStat>();
  const agentMap = new Map<string, FieldAgentStat>();

  let pos = 0;
  let ptp = 0;
  let repo = 0;
  let neg = 0;
  let totalOb = 0;
  let maxDate = '';

  for (const r of rows.slice(hi + 1)) {
    if (!Array.isArray(r) || !r.some((c) => c !== null && c !== '')) continue;

    if (colBank >= 0 || colNewBank >= 0) {
      const bankVal = colBank >= 0 ? clean(r[colBank]).toUpperCase() : '';
      const newBankVal = colNewBank >= 0 ? clean(r[colNewBank]).toUpperCase() : '';
      const isPsbCuring =
        (bankVal.includes('PSB') && bankVal.includes('CURING')) ||
        (newBankVal.includes('PSB') && newBankVal.includes('CURING'));
      if (!isPsbCuring) continue;
    }

    const area = clean(r[colArea]).toUpperCase();
    if (!area) continue;

    const rawRes = clean(r[colAddrRes]);
    const kind = classifyResult(rawRes);
    if (!kind || kind === 'CANCEL') continue;

    const ob = colOb >= 0 ? num(r[colOb]) : 0;
    const rawTag = colAgent >= 0 ? clean(r[colAgent]).toUpperCase() : '';
    const dStr = colDate >= 0 ? formatExcelDate(r[colDate]) : null;
    if (dStr && dStr > maxDate) maxDate = dStr;

    if (kind === 'POS') pos += 1;
    else if (kind === 'PTP') ptp += 1;
    else if (kind === 'REPO') repo += 1;
    else if (kind === 'NEG') neg += 1;
    totalOb += ob;

    const isPositive = kind === 'POS' || kind === 'PTP' || kind === 'REPO';

    let aStat = areaMap.get(area);
    if (!aStat) {
      aStat = { area, total: 0, positive: 0, pos: 0, ptp: 0, repo: 0, neg: 0, ob: 0 };
      areaMap.set(area, aStat);
    }
    aStat.total += 1;
    if (isPositive) aStat.positive += 1;
    if (kind === 'POS') aStat.pos += 1;
    else if (kind === 'PTP') aStat.ptp += 1;
    else if (kind === 'REPO') aStat.repo += 1;
    else if (kind === 'NEG') aStat.neg += 1;
    aStat.ob = Math.round((aStat.ob + ob) * 100) / 100;

    if (rawTag) {
      let resolved = resolveFieldAgent(rawTag);
      if ((resolved.key === 'BCRM' || resolved.key === 'UNASSIGNED') && colAcct >= 0) {
        const acctClean = clean(r[colAcct]).replace(/[-\s]/g, '');
        const hit = acctMap[acctClean] || (acctClean.length > 10 ? acctMap[acctClean.slice(-10)] : undefined);
        if (hit) resolved = resolveFieldAgent(hit);
      }
      if (resolved.key in TAG_TO_AGENT) {
        const agKey = resolved.name;
        let agStat = agentMap.get(agKey);
        if (!agStat) {
          agStat = {
            tag: resolved.key,
            name: resolved.name,
            total: 0,
            positive: 0,
            pos: 0,
            ptp: 0,
            repo: 0,
            neg: 0,
            ob: 0,
            photo: resolved.photo,
          };
          agentMap.set(agKey, agStat);
        }
        agStat.total += 1;
        if (isPositive) agStat.positive += 1;
        if (kind === 'POS') agStat.pos += 1;
        else if (kind === 'PTP') agStat.ptp += 1;
        else if (kind === 'REPO') agStat.repo += 1;
        else if (kind === 'NEG') agStat.neg += 1;
        agStat.ob = Math.round((agStat.ob + ob) * 100) / 100;
      }
    }
  }

  const total = pos + ptp + repo + neg;
  const positive = pos + ptp + repo;
  const positiveRate = total > 0 ? Math.round((positive / total) * 1000) / 10 : 0;

  const areas = Array.from(areaMap.values()).sort(
    (a, b) => b.total - a.total || b.positive - a.positive,
  );
  const agents = Array.from(agentMap.values()).sort(
    (a, b) => b.positive - a.positive || b.total - a.total,
  );

  const asOf = maxDate || new Date(file.lastModified || Date.now()).toISOString().slice(0, 10);

  const field: FieldReport = {
    asOf,
    total,
    positive,
    pos,
    ptp,
    repo,
    neg,
    positiveRate,
    totalOb: Math.round(totalOb * 100) / 100,
    areas,
    agents,
  };

  const summary = `Field Visits (${asOf}): ${total} visits (${positive} positive / ${positiveRate}% rate, ${neg} neg) across ${areas.length} areas`;
  return { field, summary };
}
