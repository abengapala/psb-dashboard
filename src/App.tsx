import { useEffect, useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { useCursorHide } from './hooks/useUtils';
import { preloadPhotos, useReducedMotion } from './components/ui/bento-primitives';
import { Header } from './components/Header';
import { KpiRow } from './components/KpiRow';
import { AgentTable } from './components/AgentTable';
import { RankingCard } from './components/RankingCard';
import { Footer } from './components/Footer';
import { MilestoneToast } from './components/MilestoneToast';
import { AdminPage } from './components/AdminPage';
import { EodPage } from './components/EodPage';
import { EASE } from './lib/format';

const ROTATE_MS = 20_000;

function TVDashboard() {
  const { data, offline, lastFetch, stale, postedDelta, milestones, dismissMilestone } = useDashboardData();
  const reduce = useReducedMotion();
  useCursorHide(3000);

  // Staggered entrance once on first load
  const [entered, setEntered] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [page, setPage] = useState<'perf' | 'eod'>('perf');

  const hasEod = Boolean(
    data?.eod && (data.eod.ptp.length > 0 || data.eod.confirmed.length > 0),
  );

  // Auto-rotate between Performance and Daily EOD Report every 20 seconds
  useEffect(() => {
    if (!hasEod) {
      setPage('perf');
      return;
    }
    const id = setInterval(() => {
      setPage((prev) => (prev === 'perf' ? 'eod' : 'perf'));
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [hasEod, page]);

  useEffect(() => {
    if (!data || entered) return;
    const r = requestAnimationFrame(() => setEntered(true));
    const t = setTimeout(() => setFirstLoad(false), 1600);
    return () => {
      cancelAnimationFrame(r);
      clearTimeout(t);
    };
  }, [data, entered]);

  // Preload agent photos whenever roster updates so refreshes never flicker
  useEffect(() => {
    if (data?.agents) {
      preloadPhotos(data.agents.map((a) => a.photo));
    }
  }, [data]);

  // Optional ?theme=light support (dark by default)
  useEffect(() => {
    const light = new URLSearchParams(window.location.search).get('theme') === 'light';
    document.documentElement.classList.toggle('light', light);
  }, []);

  // Burn-in protection: shift by random 0-2 px every 4 minutes
  const [shift, setShift] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setShift({
        x: Math.round(Math.random() * 2),
        y: Math.round(Math.random() * 2),
      });
    }, 4 * 60 * 1000);
    return () => clearInterval(id);
  }, [reduce]);

  if (!data) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          background: 'var(--canvas)',
          color: 'var(--t2)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div
          style={{
            fontSize: 'clamp(11px, 0.78vw, 15px)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#E8FF1F',
          }}
        >
          PSB AUTO CURING
        </div>
        <div style={{ fontSize: 'clamp(16px, 1.3vw, 24px)', fontWeight: 500 }}>
          Waiting for data…
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        padding: '1.1vh 1.2vw',
        background: 'var(--canvas)',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gap: '0.95vh',
        transform: `translate3d(${shift.x}px, ${shift.y}px, 0)`,
        transition: reduce ? 'none' : `transform 2000ms ${EASE}`,
      }}
    >
      {/* Row 1: Header */}
      <Header
        month={data.month}
        manpower={data.kpi.manpower}
        updatedAt={data.updatedAt}
        stale={stale}
        offline={offline}
        entered={entered}
        page={hasEod ? page : 'perf'}
        hasEod={hasEod}
        onTogglePage={() => setPage((p) => (p === 'perf' ? 'eod' : 'perf'))}
      />

      {/* Row 2: Rotating Page Viewport (Performance <-> Daily EOD Report every 20s) */}
      <div style={{ position: 'relative', minHeight: 0, height: '100%', overflow: 'hidden' }}>
        {/* Page 1: Individual Performance Monitoring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            gap: '0.95vh',
            minHeight: 0,
            opacity: page === 'perf' || !hasEod ? 1 : 0,
            transform:
              page === 'perf' || !hasEod
                ? 'translate3d(0, 0, 0) scale(1)'
                : 'translate3d(-1.5vw, 0, 0) scale(0.985)',
            transition: reduce
              ? 'none'
              : `opacity 750ms ${EASE}, transform 850ms ${EASE}`,
            pointerEvents: page === 'perf' || !hasEod ? 'auto' : 'none',
          }}
        >
          {/* 5 KPI Cards (12-col grid) */}
          <KpiRow kpi={data.kpi} postedDelta={postedDelta} entered={entered} />

          {/* Agent Table (span 8) + Stacked Ranking Cards (span 4) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
              gap: '1vw',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <div style={{ gridColumn: 'span 8', minHeight: 0, height: '100%' }}>
              <AgentTable agents={data.agents} firstLoad={firstLoad} entered={entered} />
            </div>

            <div
              style={{
                gridColumn: 'span 4',
                minHeight: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.95vh',
              }}
            >
              <RankingCard
                title="Posted Ranking"
                subtitle="By final posted"
                agents={data.agents}
                mode="posted"
                delay={560}
                entered={entered}
              />
              <RankingCard
                title="Repo Count"
                subtitle="Voluntary surrender"
                agents={data.agents}
                mode="repo"
                delay={640}
                entered={entered}
              />
            </div>
          </div>
        </div>

        {/* Page 2: Daily EOD Report (Columns A-H) */}
        {hasEod && data.eod && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              minHeight: 0,
              opacity: page === 'eod' ? 1 : 0,
              transform:
                page === 'eod'
                  ? 'translate3d(0, 0, 0) scale(1)'
                  : 'translate3d(1.5vw, 0, 0) scale(0.985)',
              transition: reduce
                ? 'none'
                : `opacity 750ms ${EASE}, transform 850ms ${EASE}`,
              pointerEvents: page === 'eod' ? 'auto' : 'none',
            }}
          >
            <EodPage eod={data.eod} entered={page === 'eod'} />
          </div>
        )}
      </div>

      {/* Row 3: Warning strip + Footer */}
      <Footer
        month={data.month}
        updatedAt={data.updatedAt}
        lastFetch={lastFetch}
        offline={offline}
        warnings={data.warnings}
      />

      {/* Milestone Toast (crosses 100%) */}
      <MilestoneToast queue={milestones} onDismiss={dismissMilestone} />
    </div>
  );
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  if (hash === '#admin') return <AdminPage />;
  return <TVDashboard />;
}
