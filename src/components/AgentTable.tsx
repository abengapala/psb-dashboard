import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Card, CountUp, FlashValue, TickStrip, useReducedMotion } from './ui/bento-primitives';
import { C, EASE, EASE_ARR, peso, statusColor } from '../lib/format';
import type { Agent } from '../types';

const COLS = '2.4fr 15fr 6.8fr 10.5fr 10.5fr 15.5fr 10.5fr';

export function AgentTable({
  agents,
  firstLoad,
  entered,
}: {
  agents: Agent[];
  firstLoad: boolean;
  entered: boolean;
}) {
  const count = Math.max(agents.length, 1);
  const dense = count > 9;
  const avatarSize = dense ? 'clamp(22px, 2.3vw, 40px)' : '3.1vw';
  const rowFont = dense ? 'clamp(12px, 1.02vw, 20px)' : 'clamp(14px, 1.18vw, 23px)';
  const reduce = useReducedMotion();

  // Ambient row spotlight that glides through agents every 3.5s
  const [spotlight, setSpotlight] = useState(0);
  useEffect(() => {
    if (reduce || agents.length === 0) return;
    const id = setInterval(() => {
      setSpotlight((s) => (s + 1) % agents.length);
    }, 3500);
    return () => clearInterval(id);
  }, [agents.length, reduce]);

  return (
    <Card
      variant="glass"
      entered={entered}
      delay={480}
      style={{
        height: '100%',
        padding: 'clamp(12px, 1.15vw, 22px) clamp(14px, 1.3vw, 26px)',
      }}
    >
      {/* Card title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'clamp(6px, 0.7vh, 12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55vw' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: C.lime,
              boxShadow: `0 0 10px ${C.lime}`,
            }}
          />
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(12px, 0.95vw, 18px)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--t1)',
            }}
          >
            Target Curing vs. Actual Curing
          </h2>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1vw',
            fontSize: 'clamp(9px, 0.68vw, 13px)',
            color: 'var(--t2)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <i style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
            100%+
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <i style={{ width: 7, height: 7, borderRadius: '50%', background: C.amber, display: 'inline-block' }} />
            50–99%
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <i style={{ width: 7, height: 7, borderRadius: '50%', background: C.red, display: 'inline-block' }} />
            &lt;50%
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: COLS,
          gap: '0.6vw',
          alignItems: 'center',
          paddingBottom: '0.55vh',
          borderBottom: '1px solid var(--hair)',
          color: 'var(--t2)',
          fontSize: 'clamp(9px, 0.68vw, 13px)',
          fontWeight: 600,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
        }}
      >
        <span>#</span>
        <span>Agent</span>
        <span>Month</span>
        <span style={{ textAlign: 'right' }}>Final Posted</span>
        <span style={{ textAlign: 'right' }}>Individual Target</span>
        <span style={{ paddingLeft: '0.4vw' }}>Percent Achieved</span>
        <span style={{ textAlign: 'right' }}>OB Cured</span>
      </div>

      {/* Rows */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {agents.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'grid',
              placeItems: 'center',
              color: 'var(--t3)',
              fontSize: '1.15vw',
            }}
          >
            Waiting for agent data…
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {agents.map((agent, i) => {
              const pctCol = statusColor(agent.pct);
              const isSpot = !reduce && i === spotlight;
              return (
                <motion.div
                  key={agent.name}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    layout: { type: 'spring', stiffness: 260, damping: 28 },
                    opacity: { duration: 0.45, delay: firstLoad ? 0.48 + i * 0.045 : 0, ease: EASE_ARR },
                    y: { duration: 0.55, delay: firstLoad ? 0.48 + i * 0.045 : 0, ease: EASE_ARR },
                  }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: COLS,
                    gap: '0.6vw',
                    alignItems: 'center',
                    flex: '1 1 0',
                    minHeight: 0,
                    padding: '0 0.5vw',
                    margin: '0 -0.5vw',
                    borderRadius: 12,
                    background: isSpot ? 'rgba(255, 255, 255, 0.055)' : 'transparent',
                    boxShadow: isSpot ? 'inset 2px 0 0 #E8FF1F' : 'none',
                    transition: `background 700ms ${EASE}, box-shadow 700ms ${EASE}`,
                    borderBottom: i < agents.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                    fontSize: rowFont,
                  }}
                >
                  {/* # */}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--t3)',
                      fontWeight: 600,
                      fontSize: '0.88em',
                    }}
                  >
                    {i + 1}
                  </span>

                  {/* AGENT: Avatar + Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65vw', minWidth: 0 }}>
                    <Avatar name={agent.name} photo={agent.photo} size={avatarSize} />
                    <span
                      style={{
                        fontWeight: 600,
                        color: 'var(--t1)',
                        letterSpacing: '-0.02em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {agent.name}
                    </span>
                  </div>

                  {/* MONTH (amber pill) */}
                  <span
                    style={{
                      justifySelf: 'start',
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.18em 0.65em',
                      borderRadius: 999,
                      background: 'rgba(255, 184, 0, 0.14)',
                      border: '1px solid rgba(255, 184, 0, 0.35)',
                      color: C.amber,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(9px, 0.68vw, 13px)',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {agent.month}
                  </span>

                  {/* FINAL POSTED */}
                  <span
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--t1)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    <FlashValue value={agent.finalPosted}>
                      <CountUp value={agent.finalPosted} format={peso} />
                    </FlashValue>
                  </span>

                  {/* INDIVIDUAL TARGET */}
                  <span
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 500,
                      color: 'var(--t2)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    <CountUp value={agent.target} format={peso} />
                  </span>

                  {/* PERCENT ACHIEVED: 36-tick strip + big % */}
                  <div
                    style={{
                      paddingLeft: '0.4vw',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55vw',
                      minWidth: 0,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <TickStrip pct={agent.pct} rowIndex={i} firstLoad={firstLoad} />
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: pctCol,
                        minWidth: '3.6em',
                        textAlign: 'right',
                        letterSpacing: '-0.03em',
                      }}
                    >
                      <FlashValue value={agent.pct}>
                        <CountUp value={agent.pct} format={(n) => `${Math.round(n)}%`} />
                      </FlashValue>
                    </span>
                  </div>

                  {/* OB CURED */}
                  <span
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 500,
                      color: 'var(--t2)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    <FlashValue value={agent.obCured}>
                      <CountUp value={agent.obCured} format={peso} />
                    </FlashValue>
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
}
