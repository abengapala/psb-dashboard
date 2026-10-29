import { Users, AlertTriangle } from 'lucide-react';
import { CountUp } from './ui/bento-primitives';
import { C, EASE, fmtDateTime, int } from '../lib/format';

export function Header({
  month,
  manpower,
  updatedAt,
  stale,
  offline,
  entered,
  page = 'perf',
  hasEod = false,
  onTogglePage,
}: {
  month: string;
  manpower: number;
  updatedAt: string;
  stale: boolean;
  offline: boolean;
  entered: boolean;
  page?: 'perf' | 'eod';
  hasEod?: boolean;
  onTogglePage?: () => void;
}) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1vw',
        height: '6vh',
        minHeight: 42,
        padding: '0 0.2vw',
        opacity: entered ? 1 : 0,
        transform: entered ? 'none' : 'translateY(14px) scale(0.985)',
        transition: `opacity 750ms ${EASE}, transform 850ms ${EASE}`,
      }}
    >
      {/* Left: eyebrow + title */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
        <span
          style={{
            fontSize: 'clamp(9px, 0.62vw, 12px)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.lime,
            lineHeight: 1.1,
          }}
        >
          PSB AUTO CURING · {page === 'eod' ? 'EOD REPORT 2026 (COLS A–H)' : 'LIVE PERFORMANCE'}
        </span>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(16px, 1.55vw, 30px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--t1)',
            lineHeight: 1.15,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {page === 'eod' ? 'Daily EOD Report — PTP & Confirmed Payment' : 'Individual Performance Monitoring'}
        </h1>
      </div>

      {/* Right: stale badge + page switcher + manpower chip + month pill + live updated status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65vw', flexShrink: 0 }}>
        {hasEod && (
          <button
            type="button"
            onClick={onTogglePage}
            title="Auto-rotates every 20 seconds (click to switch now)"
            style={{
              position: 'relative',
              overflow: 'hidden',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45vw',
              height: 'clamp(28px, 3.4vh, 38px)',
              padding: '0 0.85vw',
              borderRadius: 999,
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--t1)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(10px, 0.75vw, 14px)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                padding: '2px 7px',
                borderRadius: 999,
                background: page === 'perf' ? C.lime : 'transparent',
                color: page === 'perf' ? '#0b0b0c' : 'var(--t2)',
                transition: `all 350ms ${EASE}`,
              }}
            >
              1 PERFORMANCE
            </span>
            <span
              style={{
                padding: '2px 7px',
                borderRadius: 999,
                background: page === 'eod' ? C.lime : 'transparent',
                color: page === 'eod' ? '#0b0b0c' : 'var(--t2)',
                transition: `all 350ms ${EASE}`,
              }}
            >
              2 EOD REPORT
            </span>
            <span
              key={page}
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                height: 2,
                background: C.lime,
                animation: 'tv-page-timer 20s linear forwards',
              }}
            />
          </button>
        )}
        {stale && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4vw',
              height: 'clamp(26px, 3.2vh, 36px)',
              padding: '0 0.85vw',
              borderRadius: 999,
              background: 'rgba(255, 184, 0, 0.16)',
              border: '1px solid rgba(255, 184, 0, 0.48)',
              color: C.amber,
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(10px, 0.75vw, 14px)',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            <AlertTriangle size={14} />
            <span>DATA NOT UPDATED SINCE {fmtDateTime(updatedAt)}</span>
          </div>
        )}

        {/* MANPOWER chip */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45vw',
            height: 'clamp(28px, 3.4vh, 38px)',
            padding: '0 0.9vw',
            borderRadius: 999,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--t1)',
            fontSize: 'clamp(11px, 0.85vw, 16px)',
            fontWeight: 600,
          }}
        >
          <Users size={15} color={C.violet} />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            <CountUp value={manpower} format={int} />
          </span>
          <span style={{ color: 'var(--t2)', fontWeight: 500 }}>
            {manpower === 1 ? 'agent' : 'agents'}
          </span>
        </div>

        {/* Month pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 'clamp(28px, 3.4vh, 38px)',
            padding: '0 0.95vw',
            borderRadius: 999,
            background: 'rgba(169, 178, 255, 0.14)',
            border: '1px solid rgba(169, 178, 255, 0.32)',
            color: '#FFFFFF',
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(11px, 0.82vw, 15px)',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          {month || '—'}
        </div>

        {/* Live green dot + Updated date & time */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45vw',
            height: 'clamp(28px, 3.4vh, 38px)',
            padding: '0 0.85vw',
            borderRadius: 999,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--t2)',
            fontSize: 'clamp(10px, 0.78vw, 14px)',
            fontWeight: 500,
          }}
        >
          <span
            className={offline ? undefined : 'tv-live-dot'}
            style={{
              width: 'clamp(7px, 0.5vw, 9px)',
              height: 'clamp(7px, 0.5vw, 9px)',
              borderRadius: '50%',
              background: offline ? '#6b7280' : C.green,
              boxShadow: offline ? 'none' : `0 0 10px ${C.green}`,
              flexShrink: 0,
            }}
          />
          <span>Updated {fmtDateTime(updatedAt)}</span>
        </div>
      </div>
    </header>
  );
}
