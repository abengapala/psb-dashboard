import { useCallback, useEffect, useRef, useState } from 'react';
import type { Agent, Data } from '../types';
import { parseTime } from '../lib/format';

const POLL_MS = 15_000;
const STALE_MS = 3 * 60 * 60 * 1000;

export type Milestone = { id: number; agent: Agent };

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

const DEFAULT_PHOTOS: Record<string, string> = {
  charles: 'photos/charles.png',
  jhumir: 'photos/jhumir.png',
  polo: 'photos/polo.png',
  jaymark: 'photos/jaymark.png',
  aira: 'photos/aira.png',
  josafat: 'photos/josafat.png',
  eurie: 'photos/eurie.png',
  chelsea: 'photos/Chelsea.png',
  rodel: 'photos/rodel.png',
};

function resolvePhoto(name: string, photo: unknown): string | null {
  if (typeof photo === 'string' && photo.trim()) return photo.trim();
  const first = name.trim().toLowerCase().split(/\s+/)[0] || '';
  return DEFAULT_PHOTOS[first] ?? null;
}

/** Defensive copy so a half-written or odd file never breaks the layout. */
function normalize(raw: unknown): Data {
  const r = (raw ?? {}) as Partial<Data>;
  const k = (r.kpi ?? {}) as Partial<Data['kpi']>;
  const agents = Array.isArray(r.agents) ? r.agents : [];
  return {
    month: String(r.month ?? ''),
    updatedAt: String(r.updatedAt ?? ''),
    generatedAt: String(r.generatedAt ?? ''),
    kpi: {
      manpower: num(k.manpower),
      bankTarget: num(k.bankTarget),
      posted: num(k.posted),
      repoPosted: num(k.repoPosted),
      repoCount: num(k.repoCount),
      variance: num(k.variance),
      pctAchieved: num(k.pctAchieved),
      ...(k.obTargetTotal !== undefined
        ? {
            obTargetTotal: num(k.obTargetTotal),
            obCuredTotal: num(k.obCuredTotal),
            obVariance: num(k.obVariance),
            obPctAchieved: num(k.obPctAchieved),
          }
        : {}),
    },
    agents: agents
      .filter((a) => a && typeof a.name === 'string' && a.name.trim())
      .map((a) => ({
        name: a.name.trim(),
        month: String(a.month ?? ''),
        finalPosted: num(a.finalPosted),
        target: num(a.target),
        pct: num(a.pct),
        obCured: num(a.obCured),
        ...(a.obTarget !== undefined
          ? { obTarget: num(a.obTarget), obPct: num(a.obPct) }
          : {}),
        repoPosted: num(a.repoPosted),
        repoCount: num(a.repoCount),
        photo: resolvePhoto(a.name, a.photo),
      })),
    warnings: Array.isArray(r.warnings) ? r.warnings.filter((w) => typeof w === 'string' && w.trim()) : [],
    eod: r.eod && typeof r.eod === 'object'
      ? {
          sheet: typeof r.eod.sheet === 'string' ? r.eod.sheet : undefined,
          ptp: Array.isArray(r.eod.ptp)
            ? r.eod.ptp.map((b) => ({
                bucket: String(b?.bucket ?? ''),
                count: num(b?.count),
                ac: num(b?.ac),
                ob: num(b?.ob),
              }))
            : [],
          ptpTotal: {
            count: num(r.eod.ptpTotal?.count),
            ac: num(r.eod.ptpTotal?.ac),
            ob: num(r.eod.ptpTotal?.ob),
          },
          confirmed: Array.isArray(r.eod.confirmed)
            ? r.eod.confirmed.map((b) => ({
                bucket: String(b?.bucket ?? ''),
                count: num(b?.count),
                ac: num(b?.ac),
                ob: num(b?.ob),
              }))
            : [],
          confirmedTotal: {
            count: num(r.eod.confirmedTotal?.count),
            ac: num(r.eod.confirmedTotal?.ac),
            ob: num(r.eod.confirmedTotal?.ob),
          },
        }
      : undefined,
    field: r.field && typeof r.field === 'object'
      ? {
          asOf: String(r.field.asOf ?? ''),
          total: num(r.field.total),
          positive: num(r.field.positive),
          pos: num(r.field.pos),
          ptp: num(r.field.ptp),
          repo: num(r.field.repo),
          neg: num(r.field.neg),
          positiveRate: num(r.field.positiveRate),
          totalOb: num(r.field.totalOb),
          areas: Array.isArray(r.field.areas)
            ? r.field.areas.map((a) => ({
                area: String(a?.area ?? ''),
                total: num(a?.total),
                positive: num(a?.positive),
                pos: num(a?.pos),
                ptp: num(a?.ptp),
                repo: num(a?.repo),
                neg: num(a?.neg),
                ob: num(a?.ob),
              }))
            : [],
          agents: Array.isArray(r.field.agents)
            ? r.field.agents.map((ag) => ({
                tag: String(ag?.tag ?? ''),
                name: String(ag?.name ?? ''),
                total: num(ag?.total),
                positive: num(ag?.positive),
                pos: num(ag?.pos),
                ptp: num(ag?.ptp),
                repo: num(ag?.repo),
                neg: num(ag?.neg),
                ob: num(ag?.ob),
                photo: resolvePhoto(String(ag?.name ?? ag?.tag ?? ''), ag?.photo),
              }))
            : [],
        }
      : undefined,
  };
}

/**
 * Polls data.json every 15 s. Keeps the last good data on failure, flags offline,
 * re-checks staleness on every tick, and diffs previous vs current data for
 * "+₱X this refresh" and 100% milestone toasts.
 */
export function useDashboardData() {
  const [data, setData] = useState<Data | null>(null);
  const [offline, setOffline] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [postedDelta, setPostedDelta] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const prevRef = useRef<Data | null>(null);
  const textRef = useRef('');
  const idRef = useRef(0);

  const tick = useCallback(async () => {
    setNow(Date.now());
    try {
      const isCloud =
        window.location.port !== '8080' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';

      let res: Response | null = null;
      if (isCloud) {
        const apiRes = await fetch('./api/data?t=' + Date.now(), { cache: 'no-store' }).catch(
          () => null,
        );
        if (apiRes && apiRes.ok) {
          res = apiRes;
        }
      }
      if (!res) {
        res = await fetch('data.json?t=' + Date.now(), { cache: 'no-store' });
      }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      let text = await res.text();

      // If an admin uploaded directly in this browser more recently, prefer that until cloud syncs
      try {
        const localRaw = localStorage.getItem('psb_override_data');
        if (localRaw) {
          const localObj = JSON.parse(localRaw);
          const remoteObj = JSON.parse(text);
          if (
            localObj?.generatedAt &&
            (!remoteObj?.generatedAt || localObj.generatedAt > remoteObj.generatedAt)
          ) {
            text = localRaw;
          }
        }
      } catch {
        // ignore
      }

      const json = normalize(JSON.parse(text));
      setOffline(false);
      setLastFetch(new Date());
      if (text === textRef.current) return;
      textRef.current = text;

      const prev = prevRef.current;
      if (prev) {
        const d = json.kpi.posted - prev.kpi.posted;
        setPostedDelta(d >= 1 ? d : 0);
        const before = new Map(prev.agents.map((a) => [a.name, a.pct]));
        const crossed = json.agents.filter((a) => {
          const p = before.get(a.name);
          return p !== undefined && p < 100 && a.pct >= 100;
        });
        if (crossed.length) {
          setMilestones((m) => [...m, ...crossed.map((agent) => ({ id: ++idRef.current, agent }))]);
        }
      }
      prevRef.current = json;
      setData(json);
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [tick]);

  const dismissMilestone = useCallback((id: number) => {
    setMilestones((m) => m.filter((x) => x.id !== id));
  }, []);

  const updated = parseTime(data?.updatedAt);
  const stale = !!updated && now - updated.getTime() > STALE_MS;

  return { data, offline, lastFetch, stale, postedDelta, milestones, dismissMilestone };
}
