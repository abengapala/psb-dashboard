import { motion } from 'framer-motion';
import { Avatar, CountUp, FlashValue } from './ui/bento-primitives';
import { C } from '../lib/format';
import type { Agent } from '../types';

export type RankedAgent = Agent & { rank: number };

export function Podium({
  top3,
  groupKey,
  getPrimary,
  formatPrimary,
  getSecondary,
}: {
  top3: RankedAgent[];
  groupKey: string;
  getPrimary: (a: RankedAgent) => number;
  formatPrimary: (n: number) => string;
  getSecondary?: (a: RankedAgent) => string;
}) {
  // Visual order: 2nd (left), 1st (center, raised), 3rd (right)
  const slots = [top3[1], top3[0], top3[2]].filter((x): x is RankedAgent => Boolean(x));

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        alignItems: 'end',
        gap: '0.55vw',
        paddingTop: '0.2vh',
      }}
    >
      {slots.map((agent) => {
        const isFirst = agent.rank === 1;
        const avatarSize = isFirst ? '4.8vw' : '3.8vw';
        const val = getPrimary(agent);
        const sub = getSecondary ? getSecondary(agent) : null;

        return (
          <motion.div
            key={agent.name}
            layout
            layoutId={`podium-${groupKey}-${agent.name}`}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              layout: { type: 'spring', stiffness: 260, damping: 28 },
              scale: { type: 'spring', stiffness: 260, damping: 24 },
              opacity: { duration: 0.35 },
            }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: isFirst
                ? 'clamp(8px, 0.85vh, 14px) 0.4vw clamp(8px, 0.9vh, 14px)'
                : 'clamp(6px, 0.65vh, 10px) 0.35vw clamp(6px, 0.7vh, 10px)',
              borderRadius: 'clamp(12px, 1vw, 18px)',
              background: isFirst
                ? 'linear-gradient(180deg, rgba(232,255,31,0.20) 0%, rgba(232,255,31,0.04) 100%)'
                : 'rgba(255,255,255,0.04)',
              border: isFirst
                ? '1px solid rgba(232,255,31,0.45)'
                : '1px solid rgba(255,255,255,0.10)',
              minWidth: 0,
            }}
          >
            {/* Rank medal badge + floating avatar */}
            <div
              className={`tv-float-${agent.rank}`}
              style={{ position: 'relative', marginBottom: '0.35vh' }}
            >
              <Avatar
                name={agent.name}
                photo={agent.photo}
                size={avatarSize}
                ring={isFirst ? 'lime' : 'white'}
              />
              <span
                style={{
                  position: 'absolute',
                  right: -4,
                  bottom: -2,
                  width: 'clamp(18px, 1.3vw, 24px)',
                  height: 'clamp(18px, 1.3vw, 24px)',
                  borderRadius: '50%',
                  background: isFirst ? C.lime : agent.rank === 2 ? '#E2E8F0' : C.peach,
                  color: '#0b0b0c',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: 'clamp(10px, 0.72vw, 13px)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.55)',
                }}
              >
                {agent.rank}
              </span>
            </div>

            {/* Agent name (>= 1.05vw) */}
            <div
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: 'clamp(12px, 1.05vw, 20px)',
                fontWeight: 600,
                color: 'var(--t1)',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: '0.2vh',
              }}
            >
              {agent.name}
            </div>

            {/* Big amount / count (>= 1.35vw, thin weight) */}
            <div
              style={{
                fontSize: isFirst ? 'clamp(15px, 1.42vw, 27px)' : 'clamp(13px, 1.22vw, 23px)',
                fontWeight: 300,
                letterSpacing: '-0.04em',
                color: isFirst ? C.lime : 'var(--t1)',
                lineHeight: 1.15,
                marginTop: '0.15vh',
              }}
            >
              <FlashValue value={val}>
                <CountUp value={val} format={formatPrimary} />
              </FlashValue>
            </div>

            {sub && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(9px, 0.68vw, 13px)',
                  color: 'var(--t2)',
                  marginTop: 1,
                }}
              >
                {sub}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
