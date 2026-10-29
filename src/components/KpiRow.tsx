import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CountUp, DotNumber, FlashValue, TickGauge } from './ui/bento-primitives';
import { C, int, peso } from '../lib/format';
import type { KPI } from '../types';

const CAP: React.CSSProperties = {
  fontSize: 'clamp(10px, 0.72vw, 14px)',
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  lineHeight: 1.1,
};

export function KpiRow({
  kpi,
  postedDelta,
  entered,
}: {
  kpi: KPI;
  postedDelta: number;
  entered: boolean;
}) {
  const aboveTarget = kpi.variance <= 0;
  const absVariance = Math.abs(kpi.variance);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
        gap: '1vw',
        height: '19vh',
        minHeight: 138,
      }}
    >
      {/* 1. PAYMENT POSTED (span 4): Hero card with violet/indigo mesh + DotNumber */}
      <Card
        variant="hero"
        sweep
        entered={entered}
        delay={80}
        style={{ gridColumn: 'span 4', padding: 'clamp(12px, 1.15vw, 22px)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ ...CAP, color: 'rgba(255,255,255,0.78)' }}>Payment Posted</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 'clamp(20px, 2.3vh, 26px)',
              padding: '0 0.65vw',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.68)',
              border: '1px solid rgba(232,255,31,0.45)',
              color: C.lime,
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(10px, 0.75vw, 14px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
            }}
          >
            <CountUp value={kpi.pctAchieved} format={(n) => `${Math.round(n)}% of target`} />
          </span>
        </div>

        <div style={{ position: 'relative', zIndex: 2, margin: 'auto 0', paddingTop: '0.3vh' }}>
          <FlashValue value={kpi.posted}>
            <DotNumber value={kpi.posted} />
          </FlashValue>
        </div>

        {/* Flowing stream ribbon inspired by Finance Bento net-worth card */}
        <svg
          viewBox="0 0 400 56"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '44%',
            pointerEvents: 'none',
            opacity: 0.42,
            zIndex: 1,
          }}
        >
          <path
            className="tv-stream-1"
            d="M0,38 C90,18 190,46 290,22 C345,10 380,20 400,14 L400,56 L0,56 Z"
            fill="#FFB37A"
            opacity="0.55"
          />
          <path
            className="tv-stream-2"
            d="M0,42 C100,26 200,48 300,28 C350,18 380,26 400,20 L400,56 L0,56 Z"
            fill="#A9B2FF"
            opacity="0.7"
          />
          <path
            className="tv-stream-1"
            d="M0,46 C110,34 210,50 310,34 C355,26 382,32 400,28 L400,56 L0,56 Z"
            fill="#FFFFFF"
            opacity="0.45"
          />
        </svg>

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: 'clamp(10px, 0.76vw, 14px)',
            color: 'rgba(255,255,255,0.88)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>of {peso(kpi.bankTarget)} bank target</span>
          {postedDelta > 0 && (
            <span style={{ color: C.lime, fontWeight: 600 }}>
              +{peso(postedDelta)} this refresh
            </span>
          )}
        </div>
      </Card>

      {/* 2. BANK TARGET (span 2): Glass card */}
      <Card
        variant="glass"
        entered={entered}
        delay={160}
        style={{ gridColumn: 'span 2', padding: 'clamp(12px, 1.15vw, 22px)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...CAP, color: 'var(--t2)' }}>Bank Target</span>
        </div>
        <div style={{ margin: 'auto 0' }}>
          <div
            style={{
              fontSize: 'clamp(20px, 1.95vw, 38px)',
              fontWeight: 250,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: 'var(--t1)',
            }}
          >
            <FlashValue value={kpi.bankTarget}>
              <CountUp value={kpi.bankTarget} format={peso} />
            </FlashValue>
          </div>
        </div>
        <div style={{ fontSize: 'clamp(10px, 0.75vw, 14px)', color: 'var(--t3)', fontWeight: 500 }}>
          Monthly goal · {kpi.manpower} agents
        </div>
      </Card>

      {/* 3. VARIANCE (span 2): Solid lime tile when above target, amber gradient tile when below */}
      <Card
        variant={aboveTarget ? 'lime' : 'amber'}
        entered={entered}
        delay={240}
        style={{ gridColumn: 'span 2', padding: 'clamp(12px, 1.15vw, 22px)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              ...CAP,
              color: aboveTarget ? 'rgba(11,11,12,0.68)' : 'rgba(255,255,255,0.8)',
            }}
          >
            Variance
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 'clamp(19px, 2.2vh, 24px)',
              padding: '0 0.55vw',
              borderRadius: 999,
              background: aboveTarget ? 'rgba(11,11,12,0.86)' : 'rgba(0,0,0,0.45)',
              color: aboveTarget ? C.lime : '#FFD08A',
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(9px, 0.68vw, 13px)',
              fontWeight: 600,
            }}
          >
            {aboveTarget ? 'SURPLUS' : 'REMAINING'}
          </span>
        </div>

        <div
          style={{
            margin: 'auto 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35vw',
          }}
        >
          {aboveTarget ? (
            <ArrowUpRight size={28} strokeWidth={2.4} color="#0b0b0c" style={{ flexShrink: 0 }} />
          ) : (
            <ArrowDownRight size={28} strokeWidth={2.4} color="#FFFFFF" style={{ flexShrink: 0 }} />
          )}
          <div
            style={{
              fontSize: 'clamp(19px, 1.85vw, 36px)',
              fontWeight: 260,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: aboveTarget ? '#0b0b0c' : '#FFFFFF',
            }}
          >
            <FlashValue value={absVariance}>
              <CountUp value={absVariance} format={peso} />
            </FlashValue>
          </div>
        </div>

        <div
          style={{
            fontSize: 'clamp(10px, 0.75vw, 14px)',
            fontWeight: 600,
            color: aboveTarget ? 'rgba(11,11,12,0.68)' : 'rgba(255,255,255,0.78)',
          }}
        >
          {aboveTarget ? 'above target' : 'to reach target'}
        </div>
      </Card>

      {/* 4. % ACHIEVED (span 2): 48-tick half gauge */}
      <Card
        variant="graph"
        entered={entered}
        delay={320}
        style={{ gridColumn: 'span 2', padding: 'clamp(10px, 1vw, 18px) clamp(12px, 1.1vw, 20px)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...CAP, color: 'rgba(255,255,255,0.78)' }}>% Achieved</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(9px, 0.68vw, 12px)',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 600,
            }}
          >
            Goal 100%
          </span>
        </div>
        <TickGauge pct={kpi.pctAchieved} />
      </Card>

      {/* 5. VS POSTED / COUNT (span 2): Glass card with peach accent */}
      <Card
        variant="glass"
        entered={entered}
        delay={400}
        style={{ gridColumn: 'span 2', padding: 'clamp(12px, 1.15vw, 22px)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...CAP, color: 'var(--t2)' }}>VS Posted / Count</span>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: C.peach,
            }}
          />
        </div>

        <div style={{ margin: 'auto 0' }}>
          <div
            style={{
              fontSize: 'clamp(19px, 1.85vw, 36px)',
              fontWeight: 250,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: C.peach,
            }}
          >
            <FlashValue value={kpi.repoPosted}>
              <CountUp value={kpi.repoPosted} format={peso} />
            </FlashValue>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(13px, 1.1vw, 21px)',
              fontWeight: 600,
              color: 'var(--t1)',
            }}
          >
            <FlashValue value={kpi.repoCount}>
              <CountUp value={kpi.repoCount} format={int} />
            </FlashValue>{' '}
            <span style={{ fontSize: 'clamp(10px, 0.75vw, 14px)', color: 'var(--t2)', fontWeight: 500 }}>
              repos
            </span>
          </span>
          <span style={{ fontSize: 'clamp(10px, 0.72vw, 13px)', color: 'var(--t3)' }}>
            Voluntary surrender
          </span>
        </div>
      </Card>
    </div>
  );
}
