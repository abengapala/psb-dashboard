import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Card, CountUp, FlashValue } from './ui/bento-primitives';
import { Podium, type RankedAgent } from './Podium';
import { C, int, peso } from '../lib/format';
import type { Agent } from '../types';

export function RankingCard({
  title,
  subtitle,
  agents,
  mode,
  delay,
  entered,
}: {
  title: string;
  subtitle: string;
  agents: Agent[];
  mode: 'posted' | 'repo';
  delay: number;
  entered: boolean;
}) {
  const sorted: RankedAgent[] = [...agents]
    .sort((a, b) => {
      if (mode === 'posted') return b.finalPosted - a.finalPosted;
      if (b.repoCount !== a.repoCount) return b.repoCount - a.repoCount;
      return b.repoPosted - a.repoPosted;
    })
    .map((a, i) => ({ ...a, rank: i + 1 }));

  const top3 = sorted.slice(0, 3);
  const rows = sorted.slice(3, 6); // Ranks 4, 5, 6 fill the lower half cleanly

  const getPrimary = (a: RankedAgent) => (mode === 'posted' ? a.finalPosted : a.repoCount);
  const formatPrimary = (n: number) => (mode === 'posted' ? peso(n) : `${int(n)} ${Math.round(n) === 1 ? 'repo' : 'repos'}`);
  const getSecondary = mode === 'repo' ? (a: RankedAgent) => peso(a.repoPosted) : undefined;

  return (
    <Card
      variant="glass"
      entered={entered}
      delay={delay}
      style={{
        flex: 1,
        minHeight: 0,
        padding: 'clamp(10px, 1vw, 18px) clamp(12px, 1.15vw, 22px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.4vh',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: mode === 'posted' ? C.lime : C.peach,
            }}
          />
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(11px, 0.9vw, 17px)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--t1)',
            }}
          >
            {title}
          </h2>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(9px, 0.68vw, 13px)',
            color: 'var(--t3)',
            fontWeight: 500,
          }}
        >
          {subtitle}
        </span>
      </div>

      {/* Podium (Top 3) */}
      <Podium
        top3={top3}
        groupKey={mode}
        getPrimary={getPrimary}
        formatPrimary={formatPrimary}
        getSecondary={getSecondary}
      />

      {/* Ranks 4, 5, 6 */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          marginTop: '0.55vh',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '0.35vh',
        }}
      >
        <AnimatePresence initial={false}>
          {rows.map((agent) => {
            const val = getPrimary(agent);
            return (
              <motion.div
                key={agent.name}
                layout
                layoutId={`rank-row-${mode}-${agent.name}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65vw',
                  padding: '0.2vh 0.35vw',
                  borderRadius: 10,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    width: '1.4vw',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'clamp(11px, 0.85vw, 16px)',
                    fontWeight: 700,
                    color: 'var(--t3)',
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  {agent.rank}
                </span>
                <Avatar name={agent.name} photo={agent.photo} size="2.2vw" />
                <span
                  style={{
                    flex: 1,
                    fontSize: 'clamp(12px, 0.98vw, 18px)',
                    fontWeight: 600,
                    color: 'var(--t1)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {agent.name}
                </span>
                {mode === 'repo' && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(10px, 0.78vw, 14px)',
                      color: 'var(--t3)',
                    }}
                  >
                    {peso(agent.repoPosted)}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'clamp(12px, 0.98vw, 18px)',
                    fontWeight: 600,
                    color: 'var(--t1)',
                    flexShrink: 0,
                  }}
                >
                  <FlashValue value={val}>
                    <CountUp value={val} format={formatPrimary} />
                  </FlashValue>
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
}
