import { MapPin, CheckCircle2, XCircle, Layers } from 'lucide-react';
import { Avatar, Card, CountUp, DotNumber, FlashValue } from './ui/bento-primitives';
import { PhilippinesMap } from './PhilippinesMap';
import { C, EASE, int, peso } from '../lib/format';
import type { FieldReport } from '../types';

const CAP: React.CSSProperties = {
  fontSize: 'clamp(10px, 0.72vw, 14px)',
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  lineHeight: 1.1,
};

export function FieldVisitPage({ field, entered }: { field: FieldReport; entered: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        gap: '0.95vh',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Top Row: 4 KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: '1vw',
          height: '18vh',
          minHeight: 132,
        }}
      >
        {/* 1. Hero: Positive Field Visits */}
        <Card
          variant="hero"
          sweep
          entered={entered}
          delay={60}
          style={{ gridColumn: 'span 4', padding: 'clamp(12px, 1.1vw, 20px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ ...CAP, color: 'rgba(255,255,255,0.82)' }}>Positive Field Visits</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                height: 'clamp(20px, 2.3vh, 26px)',
                padding: '0 0.65vw',
                borderRadius: 999,
                background: 'rgba(0,0,0,0.68)',
                border: '1px solid rgba(59,240,140,0.45)',
                color: C.green,
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(10px, 0.75vw, 14px)',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={13} />
              <CountUp value={field.positiveRate} format={(n) => `${Math.round(n)}% positive`} />
            </span>
          </div>

          <div style={{ position: 'relative', zIndex: 2, margin: 'auto 0', paddingTop: '0.2vh' }}>
            <FlashValue value={field.positive}>
              <DotNumber value={field.positive} />
            </FlashValue>
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 'clamp(10px, 0.75vw, 14px)',
              color: 'rgba(255,255,255,0.88)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>POS {int(field.pos)} · PTP {int(field.ptp)} · REPO {int(field.repo)}</span>
            <span style={{ color: C.lime, fontWeight: 600 }}>of {int(field.total)} visits</span>
          </div>
        </Card>

        {/* 2. Negative Visits */}
        <Card
          variant="glass"
          entered={entered}
          delay={140}
          style={{ gridColumn: 'span 2', padding: 'clamp(12px, 1.1vw, 20px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ ...CAP, color: 'var(--t2)' }}>Negative</span>
            <XCircle size={16} color={C.red} />
          </div>
          <div style={{ margin: 'auto 0' }}>
            <div
              style={{
                fontSize: 'clamp(22px, 2.1vw, 40px)',
                fontWeight: 260,
                letterSpacing: '-0.04em',
                color: C.red,
              }}
            >
              <FlashValue value={field.neg}>
                <CountUp value={field.neg} format={int} />
              </FlashValue>
            </div>
          </div>
          <div style={{ fontSize: 'clamp(10px, 0.74vw, 13px)', color: 'var(--t2)', fontFamily: 'var(--font-mono)' }}>
            {field.total > 0 ? Math.round((field.neg / field.total) * 100) : 0}% of non-cancel
          </div>
        </Card>

        {/* 3. Total Active Visits & Areas */}
        <Card
          variant="glass"
          entered={entered}
          delay={220}
          style={{ gridColumn: 'span 3', padding: 'clamp(12px, 1.1vw, 20px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ ...CAP, color: 'var(--t2)' }}>Total Field Visits</span>
            <MapPin size={16} color={C.lime} />
          </div>
          <div style={{ margin: 'auto 0' }}>
            <div
              style={{
                fontSize: 'clamp(22px, 2.1vw, 40px)',
                fontWeight: 260,
                letterSpacing: '-0.04em',
                color: C.lime,
              }}
            >
              <FlashValue value={field.total}>
                <CountUp value={field.total} format={int} />
              </FlashValue>
            </div>
          </div>
          <div style={{ fontSize: 'clamp(10px, 0.74vw, 13px)', color: 'var(--t2)', fontFamily: 'var(--font-mono)' }}>
            {field.areas.length} areas covered · As of {field.asOf || '—'}
          </div>
        </Card>

        {/* 4. Total OB Visited */}
        <Card
          variant="glass"
          entered={entered}
          delay={300}
          style={{ gridColumn: 'span 3', padding: 'clamp(12px, 1.1vw, 20px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ ...CAP, color: 'var(--t2)' }}>Total OB Visited</span>
            <Layers size={16} color={C.violet} />
          </div>
          <div style={{ margin: 'auto 0' }}>
            <div
              style={{
                fontSize: 'clamp(20px, 1.9vw, 36px)',
                fontWeight: 260,
                letterSpacing: '-0.04em',
                color: 'var(--t1)',
              }}
            >
              <FlashValue value={field.totalOb}>
                <CountUp value={field.totalOb} format={peso} />
              </FlashValue>
            </div>
          </div>
          <div style={{ fontSize: 'clamp(10px, 0.74vw, 13px)', color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>
            Excludes cancelled requests
          </div>
        </Card>
      </div>

      {/* Bottom Row: PH Map (span 6) + Area Breakdown (span 3) + Agent Field Activity (span 3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: '1vw',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* 1. Philippines Map */}
        <Card
          variant="glass"
          entered={entered}
          delay={340}
          style={{
            gridColumn: 'span 6',
            padding: 'clamp(10px, 1vw, 18px)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            height: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.4vh',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
              <span style={{ fontSize: 'clamp(12px, 0.92vw, 17px)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Philippines Field Visit Map
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 0.68vw, 12px)', color: 'var(--t3)' }}>
              POSITIVE / TOTAL VISITS
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <PhilippinesMap areas={field.areas} />
          </div>
        </Card>

        {/* 2. Area Breakdown */}
        <Card
          variant="glass"
          entered={entered}
          delay={420}
          style={{
            gridColumn: 'span 3',
            padding: 'clamp(10px, 1vw, 18px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6vh',
            minHeight: 0,
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'clamp(12px, 0.9vw, 16px)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              By Area
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 0.68vw, 12px)', color: 'var(--t3)' }}>
              POS / NEG
            </span>
          </div>

          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: '0.45vh', overflow: 'hidden' }}>
            {field.areas.slice(0, 12).map((a) => {
              const pct = a.total > 0 ? (a.positive / a.total) * 100 : 0;
              const col = a.positive === 0 ? C.red : a.neg === 0 ? C.green : a.positive >= a.neg ? C.lime : C.amber;
              return (
                <div key={a.area} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 'clamp(10px, 0.78vw, 14px)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.area}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: col, flexShrink: 0 }}>
                      {a.positive}/{a.total}
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,90,79,0.28)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: entered ? `${pct}%` : '0%',
                        height: '100%',
                        background: col,
                        transition: `width 800ms ${EASE}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 3. Agent Field Activity (or Top OB Areas when raw file has no agent tags) */}
        <Card
          variant="glass"
          entered={entered}
          delay={500}
          style={{
            gridColumn: 'span 3',
            padding: 'clamp(10px, 1vw, 18px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6vh',
            minHeight: 0,
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'clamp(12px, 0.9vw, 16px)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {field.agents.length > 0 ? 'By Agent' : 'Result & Top OB'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 0.68vw, 12px)', color: 'var(--t3)' }}>
              {field.agents.length > 0 ? 'POSITIVE RATE' : 'PSB AUTO CURING'}
            </span>
          </div>

          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: '0.5vh', overflow: 'hidden' }}>
            {field.agents.length > 0 ? (
              field.agents.slice(0, 9).map((ag) => {
                const rate = ag.total > 0 ? Math.round((ag.positive / ag.total) * 100) : 0;
                return (
                  <div
                    key={ag.tag || ag.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55vw',
                      padding: '0.45vh 0.55vw',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.035)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <Avatar name={ag.name} photo={ag.photo} size="2.1vw" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'clamp(11px, 0.82vw, 15px)', fontWeight: 600, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ag.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 0.65vw, 12px)', color: 'var(--t2)' }}>
                        {ag.positive} pos · {ag.neg} neg
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                      <div style={{ fontSize: 'clamp(12px, 0.9vw, 16px)', fontWeight: 700, color: rate >= 50 ? C.green : C.amber }}>
                        {rate}%
                      </div>
                      <div style={{ fontSize: 'clamp(9px, 0.62vw, 11px)', color: 'var(--t3)' }}>
                        {ag.total} visits
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              [...field.areas]
                .sort((a, b) => b.ob - a.ob)
                .slice(0, 8)
                .map((a, idx) => (
                  <div
                    key={a.area}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55vw',
                      padding: '0.5vh 0.6vw',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.035)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 0.78vw, 14px)', fontWeight: 700, color: 'var(--t3)', width: '1.2vw' }}>
                      {idx + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'clamp(11px, 0.82vw, 15px)', fontWeight: 600, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.area}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 0.65vw, 12px)', color: 'var(--t2)' }}>
                        {a.positive} pos · {a.neg} neg
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'clamp(11px, 0.85vw, 15px)', fontWeight: 700, color: C.lime, flexShrink: 0 }}>
                      {peso(a.ob)}
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
