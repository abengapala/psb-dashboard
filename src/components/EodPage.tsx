import { CheckCircle2, ClipboardList, TrendingUp, Layers } from 'lucide-react';
import { Card, CountUp, DotNumber, FlashValue } from './ui/bento-primitives';
import { C, EASE, clamp, int, peso } from '../lib/format';
import type { EodBucket, EodReport, EodTotals } from '../types';

const CAP: React.CSSProperties = {
  fontSize: 'clamp(10px, 0.72vw, 14px)',
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  lineHeight: 1.1,
};

const BUCKET_COLORS: Record<string, string> = {
  'FRONT END': C.lime,
  FRONTEND: C.lime,
  MIDRANGE: C.violet,
  'MID RANGE': C.violet,
  HARDCORE: C.peach,
};

function normBucket(name: string): string {
  return name.trim().toUpperCase().replace(/\s+/g, '');
}

function bucketColor(name: string): string {
  return BUCKET_COLORS[name.trim().toUpperCase()] || C.violet;
}

function EodTableCard({
  title,
  subtitle,
  colsLabel,
  countHeader,
  rows,
  totals,
  accent,
  compareRows,
  entered,
  delay,
}: {
  title: string;
  subtitle: string;
  colsLabel: string;
  countHeader: string;
  rows: EodBucket[];
  totals: EodTotals;
  accent: string;
  compareRows?: EodBucket[];
  entered: boolean;
  delay: number;
}) {
  const maxAc = Math.max(totals.ac, ...rows.map((r) => r.ac), 1);

  return (
    <Card
      variant="glass"
      entered={entered}
      delay={delay}
      style={{
        gridColumn: 'span 6',
        padding: 'clamp(14px, 1.3vw, 24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2vh',
        minHeight: 0,
        height: '100%',
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingBottom: '0.8vh',
          borderBottom: '1px solid var(--hair)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65vw' }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: accent,
              boxShadow: `0 0 12px ${accent}`,
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontSize: 'clamp(15px, 1.25vw, 24px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--t1)',
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: 'clamp(10px, 0.72vw, 13px)', color: 'var(--t2)' }}>
              {subtitle}
            </div>
          </div>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 'clamp(22px, 2.6vh, 30px)',
            padding: '0 0.75vw',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--glass-border)',
            color: accent,
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(10px, 0.72vw, 13px)',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          {colsLabel}
        </span>
      </div>

      {/* Column Headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.35fr 0.75fr 1.25fr 1.35fr',
          gap: '0.8vw',
          padding: '0 0.8vw',
          fontSize: 'clamp(10px, 0.7vw, 13px)',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--t3)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>BUCKET</span>
        <span style={{ textAlign: 'right' }}>{countHeader}</span>
        <span style={{ textAlign: 'right' }}>AC</span>
        <span style={{ textAlign: 'right' }}>OB</span>
      </div>

      {/* Bucket Rows */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1vh',
          flex: 1,
          justifyContent: 'space-evenly',
          minHeight: 0,
        }}
      >
        {rows.map((r, idx) => {
          const bColor = bucketColor(r.bucket);
          const sharePct = totals.ac > 0 ? (r.ac / totals.ac) * 100 : 0;
          const barW = clamp((r.ac / maxAc) * 100, 3, 100);
          const ptpMatch = compareRows?.find(
            (p) => normBucket(p.bucket) === normBucket(r.bucket),
          );
          const convPct = ptpMatch && ptpMatch.ac > 0 ? (r.ac / ptpMatch.ac) * 100 : null;

          return (
            <div
              key={r.bucket}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65vh',
                padding: 'clamp(10px, 1.15vh, 18px) 0.9vw',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                opacity: entered ? 1 : 0,
                transform: entered ? 'none' : 'translateY(10px)',
                transition: `opacity 600ms ${EASE} ${delay + 80 + idx * 70}ms, transform 600ms ${EASE} ${delay + 80 + idx * 70}ms`,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.35fr 0.75fr 1.25fr 1.35fr',
                  gap: '0.8vw',
                  alignItems: 'center',
                }}
              >
                {/* Bucket Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55vw', minWidth: 0 }}>
                  <span
                    style={{
                      width: 8,
                      height: 22,
                      borderRadius: 4,
                      background: bColor,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 'clamp(13px, 1.05vw, 20px)',
                        fontWeight: 700,
                        color: 'var(--t1)',
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {r.bucket}
                    </div>
                    <div
                      style={{
                        fontSize: 'clamp(9px, 0.65vw, 12px)',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--t2)',
                      }}
                    >
                      {convPct !== null
                        ? `${Math.round(convPct)}% of PTP AC`
                        : `${Math.round(sharePct)}% of total AC`}
                    </div>
                  </div>
                </div>

                {/* Count */}
                <div
                  style={{
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'clamp(15px, 1.3vw, 25px)',
                    fontWeight: 700,
                    color: bColor,
                  }}
                >
                  <FlashValue value={r.count}>
                    <CountUp value={r.count} format={int} />
                  </FlashValue>
                </div>

                {/* AC */}
                <div
                  style={{
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'clamp(14px, 1.18vw, 22px)',
                    fontWeight: 700,
                    color: 'var(--t1)',
                  }}
                >
                  <FlashValue value={r.ac}>
                    <CountUp value={r.ac} format={peso} />
                  </FlashValue>
                </div>

                {/* OB */}
                <div
                  style={{
                    textAlign: 'right',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'clamp(13px, 1.08vw, 20px)',
                    fontWeight: 500,
                    color: 'var(--t2)',
                  }}
                >
                  <FlashValue value={r.ob}>
                    <CountUp value={r.ob} format={peso} />
                  </FlashValue>
                </div>
              </div>

              {/* Progress / Share Bar */}
              <div
                style={{
                  height: 5,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: entered ? `${barW}%` : '0%',
                    height: '100%',
                    borderRadius: 999,
                    background: bColor,
                    transition: `width 950ms ${EASE} ${delay + 160 + idx * 80}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* GRAND TOTAL Footer Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.35fr 0.75fr 1.25fr 1.35fr',
          gap: '0.8vw',
          alignItems: 'center',
          padding: 'clamp(10px, 1.1vh, 16px) 0.9vw',
          borderRadius: 14,
          background:
            accent === C.green
              ? 'linear-gradient(90deg, rgba(59,240,140,0.16), rgba(59,240,140,0.05))'
              : 'linear-gradient(90deg, rgba(232,255,31,0.16), rgba(169,178,255,0.06))',
          border: `1px solid ${accent === C.green ? 'rgba(59,240,140,0.38)' : 'rgba(232,255,31,0.38)'}`,
        }}
      >
        <div
          style={{
            fontSize: 'clamp(12px, 0.95vw, 18px)',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          GRAND TOTAL
        </div>

        <div
          style={{
            textAlign: 'right',
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(16px, 1.4vw, 27px)',
            fontWeight: 800,
            color: accent,
          }}
        >
          <FlashValue value={totals.count}>
            <CountUp value={totals.count} format={int} />
          </FlashValue>
        </div>

        <div
          style={{
            textAlign: 'right',
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(15px, 1.28vw, 24px)',
            fontWeight: 800,
            color: 'var(--t1)',
          }}
        >
          <FlashValue value={totals.ac}>
            <CountUp value={totals.ac} format={peso} />
          </FlashValue>
        </div>

        <div
          style={{
            textAlign: 'right',
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(14px, 1.15vw, 22px)',
            fontWeight: 700,
            color: 'var(--t1)',
          }}
        >
          <FlashValue value={totals.ob}>
            <CountUp value={totals.ob} format={peso} />
          </FlashValue>
        </div>
      </div>
    </Card>
  );
}

export function EodPage({ eod, entered }: { eod: EodReport; entered: boolean }) {
  const { ptp, ptpTotal, confirmed, confirmedTotal } = eod;
  const acConvPct = ptpTotal.ac > 0 ? (confirmedTotal.ac / ptpTotal.ac) * 100 : 0;
  const countConvPct = ptpTotal.count > 0 ? (confirmedTotal.count / ptpTotal.count) * 100 : 0;

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
      {/* Top Row: 4 Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: '1vw',
          height: '19vh',
          minHeight: 138,
        }}
      >
        {/* 1. Hero Card: Confirmed Payment AC */}
        <Card
          variant="hero"
          sweep
          entered={entered}
          delay={60}
          style={{ gridColumn: 'span 4', padding: 'clamp(12px, 1.15vw, 22px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ ...CAP, color: 'rgba(255,255,255,0.82)' }}>Confirmed Payment (AC)</span>
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
              <CountUp value={ confirmedTotal.count } format={(n) => `${Math.round(n)} confirmed`} />
            </span>
          </div>

          <div style={{ position: 'relative', zIndex: 2, margin: 'auto 0', paddingTop: '0.3vh' }}>
            <FlashValue value={confirmedTotal.ac}>
              <DotNumber value={confirmedTotal.ac} />
            </FlashValue>
          </div>

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
            <span>OB Cured: {peso(confirmedTotal.ob)}</span>
            <span style={{ color: C.lime, fontWeight: 600 }}>
              {Math.round(acConvPct)}% of PTP AC
            </span>
          </div>
        </Card>

        {/* 2. PTP Inventory AC */}
        <Card
          variant="glass"
          entered={entered}
          delay={140}
          style={{ gridColumn: 'span 3', padding: 'clamp(12px, 1.15vw, 22px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ ...CAP, color: 'var(--t2)' }}>PTP Inventory (AC)</span>
            <ClipboardList size={16} color={C.lime} />
          </div>
          <div style={{ margin: 'auto 0' }}>
            <div
              style={{
                fontSize: 'clamp(20px, 1.95vw, 38px)',
                fontWeight: 260,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                color: C.lime,
              }}
            >
              <FlashValue value={ptpTotal.ac}>
                <CountUp value={ptpTotal.ac} format={peso} />
              </FlashValue>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'clamp(10px, 0.75vw, 14px)',
              color: 'var(--t2)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>{int(ptpTotal.count)} active PTPs</span>
            <span>3 buckets</span>
          </div>
        </Card>

        {/* 3. Total PTP OB vs Confirmed OB */}
        <Card
          variant="glass"
          entered={entered}
          delay={220}
          style={{ gridColumn: 'span 3', padding: 'clamp(12px, 1.15vw, 22px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ ...CAP, color: 'var(--t2)' }}>PTP Inventory (OB)</span>
            <Layers size={16} color={C.violet} />
          </div>
          <div style={{ margin: 'auto 0' }}>
            <div
              style={{
                fontSize: 'clamp(20px, 1.95vw, 38px)',
                fontWeight: 260,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                color: 'var(--t1)',
              }}
            >
              <FlashValue value={ptpTotal.ob}>
                <CountUp value={ptpTotal.ob} format={peso} />
              </FlashValue>
            </div>
          </div>
          <div
            style={{
              fontSize: 'clamp(10px, 0.75vw, 14px)',
              color: 'var(--t2)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Confirmed OB: <strong style={{ color: C.green }}>{peso(confirmedTotal.ob)}</strong>
          </div>
        </Card>

        {/* 4. EOD Conversion Rate */}
        <Card
          variant="lime"
          entered={entered}
          delay={300}
          style={{ gridColumn: 'span 2', padding: 'clamp(12px, 1.15vw, 22px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ ...CAP, color: 'rgba(11,11,12,0.72)' }}>PTP → Kept</span>
            <TrendingUp size={16} color="#0b0b0c" />
          </div>
          <div style={{ margin: 'auto 0' }}>
            <div
              style={{
                fontSize: 'clamp(22px, 2.1vw, 40px)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                color: '#0b0b0c',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <CountUp value={acConvPct} format={(n) => `${Math.round(n)}%`} />
            </div>
          </div>
          <div
            style={{
              fontSize: 'clamp(10px, 0.75vw, 14px)',
              fontWeight: 600,
              color: 'rgba(11,11,12,0.72)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {int(confirmedTotal.count)} / {int(ptpTotal.count)} accounts ({Math.round(countConvPct)}%)
          </div>
        </Card>
      </div>

      {/* Bottom Row: Side-by-side Tables for Columns A-D and E-H */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: '1vw',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <EodTableCard
          title="PTP INVENTORY"
          subtitle="Daily EOD Report · Active PTP by Bucket"
          colsLabel="COLS A–D"
          countHeader="PTP"
          rows={ptp}
          totals={ptpTotal}
          accent={C.lime}
          entered={entered}
          delay={340}
        />

        <EodTableCard
          title="CONFIRMED PAYMENT"
          subtitle="Daily EOD Report · Confirmed Kept by Bucket"
          colsLabel="COLS E–H"
          countHeader="CONFIRMED"
          rows={confirmed}
          totals={confirmedTotal}
          accent={C.green}
          compareRows={ptp}
          entered={entered}
          delay={440}
        />
      </div>
    </div>
  );
}
