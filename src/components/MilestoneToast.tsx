import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar } from './ui/bento-primitives';
import { C, EASE_ARR, peso } from '../lib/format';
import type { Milestone } from '../hooks/useDashboardData';

export function MilestoneToast({
  queue,
  onDismiss,
}: {
  queue: Milestone[];
  onDismiss: (id: number) => void;
}) {
  const current = queue[0] ?? null;

  useEffect(() => {
    if (!current) return;
    const id = setTimeout(() => onDismiss(current.id), 6000);
    return () => clearTimeout(id);
  }, [current, onDismiss]);

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '2.6vh',
        transform: 'translateX(-50%)',
        zIndex: 60,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE_ARR }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.9vw',
              padding: '0.9vh 1.4vw 0.9vh 0.9vw',
              borderRadius: 999,
              background: 'rgba(12, 13, 18, 0.96)',
              border: `1.5px solid ${C.lime}`,
              boxShadow: '0 18px 44px -10px rgba(0,0,0,0.75), 0 0 28px rgba(232,255,31,0.32)',
              color: '#FFFFFF',
            }}
          >
            <Avatar name={current.agent.name} photo={current.agent.photo} size="3.4vw" ring="lime" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(10px, 0.72vw, 13px)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: C.lime,
                }}
              >
                Milestone Reached
              </span>
              <span style={{ fontSize: 'clamp(14px, 1.15vw, 22px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                {current.agent.name} reached {Math.round(current.agent.pct)}% of target ({peso(current.agent.finalPosted)})
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
