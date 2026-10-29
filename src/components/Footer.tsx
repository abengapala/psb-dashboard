import { AlertTriangle } from 'lucide-react';
import { C, fmtDateTime, fmtTime } from '../lib/format';

export function Footer({
  month,
  updatedAt,
  lastFetch,
  offline,
  warnings,
}: {
  month: string;
  updatedAt: string;
  lastFetch: Date | null;
  offline: boolean;
  warnings: string[];
}) {
  return (
    <footer style={{ display: 'flex', flexDirection: 'column', gap: '0.45vh' }}>
      {warnings.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6vw',
            padding: '0.45vh 0.9vw',
            borderRadius: 12,
            background: 'rgba(255, 184, 0, 0.14)',
            border: '1px solid rgba(255, 184, 0, 0.42)',
            color: C.amber,
            fontSize: 'clamp(10px, 0.78vw, 15px)',
            fontWeight: 500,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {warnings.join('  •  ')}
          </span>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 0.35vw',
          fontSize: 'clamp(11px, 0.82vw, 15px)',
          color: 'var(--t3)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>
          {month} · Excel saved {fmtDateTime(updatedAt)} · checked {fmtTime(lastFetch)}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45vw' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: offline ? '#6b7280' : C.green,
              opacity: offline ? 0.9 : 0.75,
            }}
          />
          <span>{offline ? 'offline — showing last good data' : 'live · 15s poll'}</span>
        </div>
      </div>
    </footer>
  );
}
