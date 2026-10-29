import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { C, EASE, hashColor, initials, peso, statusColor } from '../../lib/format';

/* ── Reduced motion hook ── */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(m.matches);
    const on = () => setReduce(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return reduce;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* ── Mesh backgrounds (radial-gradient only; no filter:blur / backdrop-filter for TV GPUs) ── */
export type CardVariant = 'glass' | 'hero' | 'graph' | 'lime' | 'amber' | 'copper';

const MESH: Record<Exclude<CardVariant, 'glass'>, { bg: string; darkText?: boolean; rim?: string }> = {
  hero: {
    bg: [
      'radial-gradient(120% 95% at 50% 108%, #04061d 0%, rgba(4,6,29,0.92) 44%, rgba(4,6,29,0) 76%)',
      'radial-gradient(90% 60% at 18% 0%, rgba(185,166,255,0.65) 0%, rgba(185,166,255,0) 70%)',
      'linear-gradient(180deg, #A9B2FF 0%, #3C2CFF 42%, #191366 78%, #06060f 100%)',
    ].join(','),
  },
  graph: {
    bg: [
      'radial-gradient(115% 90% at 50% 108%, #060608 0%, rgba(6,6,8,0.92) 48%, rgba(6,6,8,0) 78%)',
      'linear-gradient(180deg, #747482 0%, #2b2b34 38%, #18181e 76%, #0c0c10 100%)',
    ].join(','),
  },
  lime: {
    bg: [
      'radial-gradient(110% 85% at 50% 115%, rgba(18,23,0,0.55) 0%, rgba(18,23,0,0) 68%)',
      'linear-gradient(180deg, #F6FFB8 0%, #E8FF1F 42%, #B8D400 100%)',
    ].join(','),
    darkText: true,
    rim: 'inset 0 1px 0 rgba(255,255,255,.65), inset 0 0 0 1px rgba(0,0,0,.12)',
  },
  amber: {
    bg: [
      'radial-gradient(115% 90% at 50% 112%, #1d0b05 0%, rgba(29,11,5,0.85) 48%, rgba(29,11,5,0) 78%)',
      'linear-gradient(180deg, #FFD08A 0%, #D9821B 42%, #6E3808 100%)',
    ].join(','),
  },
  copper: {
    bg: [
      'radial-gradient(115% 90% at 50% 110%, #160a05 0%, rgba(22,10,5,0.88) 46%, rgba(22,10,5,0) 78%)',
      'linear-gradient(180deg, #F6BF96 0%, #9E4F28 40%, #2A140B 100%)',
    ].join(','),
  },
};

export function Card({
  variant = 'glass',
  sweep = false,
  delay = 0,
  entered = true,
  className = '',
  style,
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  variant?: CardVariant;
  sweep?: boolean;
  delay?: number;
  entered?: boolean;
}) {
  const isGlass = variant === 'glass';
  const m = isGlass ? null : MESH[variant];
  const darkText = m?.darkText ?? false;

  return (
    <section
      {...rest}
      className={`tv-card ${sweep ? 'tv-sweep' : ''} ${className}`}
      style={{
        position: 'relative',
        borderRadius: 'clamp(16px, 1.45vw, 28px)',
        overflow: 'hidden',
        background: isGlass ? 'var(--glass-bg)' : m!.bg,
        border: isGlass ? '1px solid var(--glass-border)' : 'none',
        color: darkText ? '#0b0b0c' : 'var(--t1)',
        opacity: entered ? 1 : 0,
        transform: entered ? 'none' : 'translateY(14px) scale(0.985)',
        transition: `opacity 760ms ${EASE} ${delay}ms, transform 860ms ${EASE} ${delay}ms`,
        ...style,
      }}
    >
      {!isGlass && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            boxShadow: m?.rim ?? 'inset 0 1px 0 rgba(255,255,255,.22), inset 0 0 0 1px rgba(255,255,255,.07)',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />
      )}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </section>
  );
}

/* ── CountUp: animates from PREVIOUS value to new value, never restarts from 0 ── */
export function CountUp({
  value,
  format = (n: number) => Math.round(n).toLocaleString('en-US'),
  duration = 1100,
  className,
  style,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const spanRef = useRef<HTMLSpanElement>(null);
  const curRef = useRef<number>(value);
  const fmtRef = useRef(format);
  fmtRef.current = format;

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const from = curRef.current;
    const to = Number.isFinite(value) ? value : 0;
    if (reduce || Math.round(from) === Math.round(to)) {
      curRef.current = to;
      el.textContent = fmtRef.current(to);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const v = from + (to - from) * easeOut(p);
      curRef.current = v;
      el.textContent = fmtRef.current(v);
      if (p < 1) raf = requestAnimationFrame(step);
      else curRef.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduce]);

  return (
    <span
      ref={spanRef}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums', ...style }}
    >
      {format(value)}
    </span>
  );
}

/* ── FlashValue: soft green highlight for 1.5 s when a number increases ── */
export function FlashValue({
  value,
  children,
  style,
}: {
  value: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const prevRef = useRef<number | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    if (reduce || prev === null || value <= prev) return;
    setFlash(true);
    const id = setTimeout(() => setFlash(false), 1500);
    return () => clearTimeout(id);
  }, [value, reduce]);

  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: 6,
        padding: '0 0.18em',
        margin: '0 -0.18em',
        background: flash ? 'rgba(59, 240, 140, 0.26)' : 'transparent',
        boxShadow: flash ? '0 0 0 1px rgba(59, 240, 140, 0.45)' : 'none',
        transition: `background 600ms ${EASE}, box-shadow 600ms ${EASE}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ── Dot-matrix hero number (5x7 glyphs for digits, comma, and ₱) ── */
const GLYPHS: Record<string, string[]> = {
  '₱': ['11110', '10001', '11111', '10001', '11110', '10000', '10000'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ',': ['00', '00', '00', '00', '00', '01', '10'],
  '-': ['000', '000', '000', '111', '000', '000', '000'],
  ' ': ['00', '00', '00', '00', '00', '00', '00'],
};

export function DotNumber({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState<number>(value);
  const [built, setBuilt] = useState(false);
  const curRef = useRef<number>(value);

  useEffect(() => {
    const id = requestAnimationFrame(() => setBuilt(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const from = curRef.current;
    const to = Number.isFinite(value) ? value : 0;
    if (reduce || Math.round(from) === Math.round(to)) {
      curRef.current = to;
      setDisplay(to);
      return;
    }
    const t0 = performance.now();
    const dur = 1050;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const v = from + (to - from) * easeOut(p);
      curRef.current = v;
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(step);
      else curRef.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  const text = peso(display);
  const { cols, active } = useMemo(() => {
    const on = new Set<string>();
    let x = 0;
    for (const ch of text) {
      const g = GLYPHS[ch] ?? GLYPHS[' '];
      const w = g[0].length;
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < w; c++) {
          if (g[r][c] === '1') on.add(`${x + c},${r}`);
        }
      }
      x += w + 1;
    }
    return { cols: Math.max(1, x - 1), active: on };
  }, [text]);

  const pitch = 8;
  const W = cols * pitch;
  const H = 7 * pitch;

  return (
    <div role="img" aria-label={peso(value)} style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'clamp(34px, 4.1vh, 56px)', display: 'block', overflow: 'visible' }}
        preserveAspectRatio="xMinYMid meet"
        aria-hidden="true"
      >
        {Array.from({ length: cols }, (_, c) =>
          Array.from({ length: 7 }, (_, r) => {
            const on = built && active.has(`${c},${r}`);
            return (
              <circle
                key={`${c}-${r}`}
                className={on ? 'tv-dot-on' : undefined}
                cx={c * pitch + pitch / 2}
                cy={r * pitch + pitch / 2}
                r={pitch * 0.37}
                fill="#FFFFFF"
                style={{
                  ['--dot-delay' as string]: `${c * 45}ms`,
                  opacity: on ? 1 : 0.09,
                  transform: on ? 'scale(1)' : 'scale(0.55)',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transition: reduce
                    ? 'none'
                    : `opacity 260ms ${EASE} ${c * 26}ms, transform 260ms ${EASE} ${c * 26}ms`,
                }}
              />
            );
          }),
        )}
      </svg>
    </div>
  );
}

/* ── TickGauge: 48-tick half gauge for % ACHIEVED (never clips 3-digit values like 161% or 308%) ── */
export function TickGauge({ pct }: { pct: number }) {
  const reduce = useReducedMotion();
  const totalTicks = 48;
  const clamped = Math.max(0, Math.min(pct, 100));
  const litTarget = Math.round((clamped / 100) * totalTicks);
  const overflowTicks = pct > 100 ? Math.min(12, Math.max(2, Math.round(((pct - 100) / 200) * 12))) : 0;

  const [litCount, setLitCount] = useState(() => (reduce ? litTarget : 0));
  const prevLitRef = useRef<number>(0);

  useEffect(() => {
    if (reduce) {
      setLitCount(litTarget);
      prevLitRef.current = litTarget;
      return;
    }
    const start = prevLitRef.current;
    const end = litTarget;
    if (start === end) return;
    const dir = end > start ? 1 : -1;
    let cur = start;
    const id = setInterval(() => {
      cur += dir;
      setLitCount(cur);
      if (cur === end) {
        prevLitRef.current = end;
        clearInterval(id);
      }
    }, 12);
    return () => clearInterval(id);
  }, [litTarget, reduce]);

  const baseColor = statusColor(pct);
  const R1 = 126;

  return (
    <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="-142 -136 284 152"
        style={{ width: '100%', height: '100%', maxHeight: '13.5vh', overflow: 'visible', display: 'block' }}
        aria-label={`${Math.round(pct)}% achieved`}
      >
        {Array.from({ length: totalTicks + 1 }, (_, i) => {
          const f = i / totalTicks;
          const deg = 180 + f * 180;
          const rad = (deg * Math.PI) / 180;
          const major = i % 6 === 0;
          const r2 = major ? 102 : 108;
          const x1 = R1 * Math.cos(rad);
          const y1 = R1 * Math.sin(rad);
          const x2 = r2 * Math.cos(rad);
          const y2 = r2 * Math.sin(rad);
          const isLit = i <= litCount && litTarget > 0;
          const isOverflow = pct > 100 && i > totalTicks - overflowTicks;
          const stroke = isOverflow ? C.lime : isLit ? baseColor : 'rgba(255,255,255,.18)';
          return (
            <line
              key={i}
              className={isLit || isOverflow ? 'tv-tick-on' : undefined}
              x1={x1.toFixed(1)}
              y1={y1.toFixed(1)}
              x2={x2.toFixed(1)}
              y2={y2.toFixed(1)}
              stroke={stroke}
              strokeWidth={isOverflow ? 3.4 : 2.8}
              strokeLinecap="round"
              style={{
                ['--tick-delay' as string]: `${i * 40}ms`,
                transition: reduce ? 'none' : `stroke 240ms ${EASE}`,
              }}
            />
          );
        })}
        {/* Center number sized well inside inner radius (102) so 3-digit values like 161% / 308% never clip */}
        <text
          x="0"
          y="-22"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Geist Variable, Geist, sans-serif"
          fontWeight="250"
          fontSize={pct >= 100 ? '44' : '48'}
          letterSpacing="-2"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {Math.round(pct)}
          <tspan fontSize="18" dy="-16" fill={ pct >= 100 ? C.lime : C.t2 } fontWeight="500">
            %
          </tspan>
        </text>
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fill={pct >= 100 ? C.lime : C.t3}
          fontFamily="Geist Mono Variable, Geist Mono, monospace"
          fontSize="11.5"
          fontWeight="600"
          letterSpacing="0.06em"
        >
          {pct > 100 ? `+${Math.round(pct - 100)}% OVER GOAL` : 'OF TARGET'}
        </text>
      </svg>
    </div>
  );
}

/* ── TickStrip: 36 vertical ticks per agent row + "+208%" lime overflow tag when > 100% ── */
export function TickStrip({
  pct,
  rowIndex = 0,
  firstLoad = false,
}: {
  pct: number;
  rowIndex?: number;
  firstLoad?: boolean;
}) {
  const reduce = useReducedMotion();
  const N = 36;
  const clamped = Math.max(0, Math.min(pct, 100));
  const targetLit = Math.round((clamped / 100) * N);
  const color = statusColor(pct);
  const overflow = pct > 100 ? Math.round(pct - 100) : 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45vw', width: '100%', minWidth: 0 }}>
      <svg
        viewBox={`0 0 ${N * 4} 16`}
        preserveAspectRatio="none"
        style={{ flex: 1, height: 'clamp(11px, 1.25vh, 16px)', display: 'block', minWidth: 0 }}
        aria-hidden="true"
      >
        {Array.from({ length: N }, (_, i) => {
          const on = i < targetLit;
          const major = i % 9 === 0;
          const delay = firstLoad && !reduce ? rowIndex * 40 + i * 10 : i * 6;
          return (
            <line
              key={i}
              className={on ? 'tv-tick-on' : undefined}
              x1={i * 4 + 2}
              x2={i * 4 + 2}
              y1={major ? 1.5 : 4}
              y2={14.5}
              stroke={on ? color : 'rgba(255,255,255,.18)'}
              strokeWidth={1.7}
              strokeLinecap="round"
              style={{
                ['--tick-delay' as string]: `${rowIndex * 180 + i * 35}ms`,
                transition: reduce ? 'none' : `stroke 260ms ${EASE} ${delay}ms`,
              }}
            />
          );
        })}
      </svg>
      {overflow > 0 && (
        <span
          style={{
            flexShrink: 0,
            padding: '0.1em 0.42em',
            borderRadius: 999,
            background: 'rgba(232, 255, 31, 0.16)',
            border: '1px solid rgba(232, 255, 31, 0.42)',
            color: C.lime,
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(9px, 0.72vw, 13px)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          +{overflow}%
        </span>
      )}
    </div>
  );
}

/* ── Avatar: preload cache + encodeURI + initials fallback + 400ms fade-in + ring ── */
const loadedPhotoUrls = new Map<string, 'ok' | 'err'>();

export function preloadPhotos(paths: (string | null | undefined)[]) {
  for (const raw of paths) {
    if (!raw) continue;
    const url = encodeURI(raw);
    if (loadedPhotoUrls.has(url)) continue;
    const img = new Image();
    img.onload = () => loadedPhotoUrls.set(url, 'ok');
    img.onerror = () => loadedPhotoUrls.set(url, 'err');
    img.src = url;
  }
}

export function Avatar({
  name,
  photo,
  size = '3.1vw',
  ring = 'none',
}: {
  name: string;
  photo: string | null;
  size?: string;
  ring?: 'none' | 'lime' | 'white';
}) {
  const url = photo ? encodeURI(photo) : null;
  const cached = url ? loadedPhotoUrls.get(url) : undefined;
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>(() =>
    cached === 'ok' ? 'ok' : cached === 'err' ? 'err' : 'idle',
  );

  useEffect(() => {
    if (!url) {
      setStatus('idle');
      return;
    }
    const c = loadedPhotoUrls.get(url);
    if (c) {
      setStatus(c);
      return;
    }
    let alive = true;
    const img = new Image();
    img.onload = () => {
      loadedPhotoUrls.set(url, 'ok');
      if (alive) setStatus('ok');
    };
    img.onerror = () => {
      loadedPhotoUrls.set(url, 'err');
      if (alive) setStatus('err');
    };
    img.src = url;
    return () => {
      alive = false;
    };
  }, [url]);

  const bg = hashColor(name);
  const darkInk = bg === '#E8FF1F' || bg === '#3BF08C' || bg === '#FDE68A' || bg === '#FFB37A' || bg === '#7DD3FC';
  const id = useId();

  const ringStyle: React.CSSProperties =
    ring === 'lime'
      ? {
          boxShadow: `0 0 0 2.5px ${C.lime}, 0 0 22px rgba(232,255,31,0.45)`,
        }
      : ring === 'white'
      ? {
          boxShadow: '0 0 0 1.8px rgba(255,255,255,0.65)',
        }
      : {
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)',
        };

  return (
    <div
      key={id}
      className={ring === 'lime' ? 'tv-pulse-ring' : undefined}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        background: bg,
        display: 'grid',
        placeItems: 'center',
        userSelect: 'none',
        ...ringStyle,
      }}
    >
      {/* Initials fallback is always underneath so there is zero layout jump */}
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: `calc(${size} * 0.36)`,
          letterSpacing: '-0.03em',
          color: darkInk ? '#0b0b0c' : '#0b0b0c',
          lineHeight: 1,
        }}
      >
        {initials(name)}
      </span>
      {url && status !== 'err' && (
        <img
          src={url}
          alt={name}
          onLoad={() => {
            loadedPhotoUrls.set(url, 'ok');
            setStatus('ok');
          }}
          onError={() => {
            loadedPhotoUrls.set(url, 'err');
            setStatus('err');
          }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 25%',
            opacity: status === 'ok' ? 1 : 0,
            transition: `opacity 400ms ${EASE}`,
          }}
        />
      )}
    </div>
  );
}
