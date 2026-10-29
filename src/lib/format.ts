/** Shared formatting + palette helpers. No decimals anywhere on screen. */

export const EASE = 'cubic-bezier(.32,.72,0,1)';
export const EASE_ARR: [number, number, number, number] = [0.32, 0.72, 0, 1];

export const C = {
  lime: '#E8FF1F',
  violet: '#A9B2FF',
  indigo: '#3C2CFF',
  peach: '#FFB37A',
  green: '#3BF08C',
  amber: '#FFB800',
  red: '#FF5A4F',
  t1: '#FFFFFF',
  t2: 'rgba(255,255,255,.56)',
  t3: 'rgba(255,255,255,.38)',
  off: 'rgba(255,255,255,.16)',
} as const;

const safe = (n: number) => (Number.isFinite(n) ? n : 0);

/** ₱21,142,361 */
export function peso(n: number): string {
  const v = Math.round(safe(n));
  return (v < 0 ? '-' : '') + '₱' + Math.abs(v).toLocaleString('en-US');
}

/** 1,234 */
export function int(n: number): string {
  return Math.round(safe(n)).toLocaleString('en-US');
}

export function parseTime(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "Oct 28, 4:26 PM" (always includes the date) */
export function fmtDateTime(v: string | Date | null | undefined): string {
  const d = typeof v === 'string' ? parseTime(v) : v ?? null;
  if (!d) return '—';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** "4:26 PM" */
export function fmtTime(d: Date | null | undefined): string {
  if (!d) return '—';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase() || '?'
  );
}

const AVATAR_COLORS = ['#A9B2FF', '#FFB37A', '#E8FF1F', '#3BF08C', '#FF9ECF', '#7DD3FC', '#C4B5FD', '#FDE68A'];

/** Stable color for a name (same name -> same color on every refresh). */
export function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function statusColor(pct: number): string {
  if (pct >= 100) return C.green;
  if (pct >= 50) return C.amber;
  return C.red;
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

