import { useCallback, useEffect, useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { C } from '../lib/format';

const VIEWER_KEY = 'psb_viewer_access';

type StoredAccess = {
  version: string;
  unlockedAt: number;
};

export function ViewerGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'locked' | 'unlocked'>('checking');
  const [serverVersion, setServerVersion] = useState<string>('1');
  const [passcode, setPasscode] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const checkAccess = useCallback(async () => {
    try {
      const res = await fetch('./api/access?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) {
        setStatus('unlocked');
        return;
      }
      const cfg = await res.json();
      const ver = String(cfg.version || '1');
      setServerVersion(ver);

      if (!cfg.required) {
        setStatus('unlocked');
        return;
      }

      try {
        const raw = localStorage.getItem(VIEWER_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredAccess;
          if (parsed.version === ver) {
            setStatus('unlocked');
            return;
          }
        }
      } catch {
        // ignore
      }
      setStatus('locked');
    } catch {
      // If offline and already unlocked previously, keep unlocked
      setStatus((prev) => (prev === 'unlocked' ? 'unlocked' : 'locked'));
    }
  }, []);

  useEffect(() => {
    checkAccess();
    const id = setInterval(checkAccess, 15_000);
    return () => clearInterval(id);
  }, [checkAccess]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('./api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', passcode: passcode.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        const ver = String(json.version || serverVersion || '1');
        localStorage.setItem(
          VIEWER_KEY,
          JSON.stringify({ version: ver, unlockedAt: Date.now() }),
        );
        setPasscode('');
        setStatus('unlocked');
      } else {
        setErr(json.message || 'Incorrect passcode. Try again.');
        setPasscode('');
      }
    } catch {
      setErr('Unable to verify passcode. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'unlocked') {
    return <>{children}</>;
  }

  if (status === 'checking') {
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
            color: C.lime,
          }}
        >
          PSB AUTO CURING
        </div>
        <div style={{ fontSize: 'clamp(15px, 1.2vw, 22px)', fontWeight: 500 }}>
          Verifying access…
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--canvas)',
        padding: 24,
        fontFamily: 'var(--font-sans)',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: 24,
          padding: 36,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(232, 255, 31, 0.14)',
              border: '1px solid rgba(232, 255, 31, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              color: C.lime,
            }}
          >
            <Lock size={26} />
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: C.lime,
              marginBottom: 4,
            }}
          >
            PSB AUTO CURING
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', margin: 0 }}>
            Dashboard Protected
          </h1>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 6 }}>
            Enter the team passcode to view live performance &amp; EOD metrics.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--t2)',
            }}
          >
            Viewer Passcode
          </label>
          <input
            type="password"
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              setErr(null);
            }}
            placeholder="Enter passcode"
            autoFocus
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              border: `1px solid ${err ? C.red : 'rgba(255, 255, 255, 0.16)'}`,
              borderRadius: 12,
              padding: '13px 16px',
              color: '#FFFFFF',
              fontSize: 16,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              outline: 'none',
              width: '100%',
            }}
          />
          {err && <span style={{ fontSize: 12, color: C.red }}>{err}</span>}
        </div>

        <button
          type="submit"
          disabled={busy || !passcode.trim()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: busy || !passcode.trim() ? 0.55 : 1,
            background: C.lime,
            color: '#0b0b0c',
            border: 'none',
            borderRadius: 12,
            padding: '13px 0',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          <ShieldCheck size={18} />
          {busy ? 'Checking…' : 'Unlock Dashboard'}
        </button>
      </form>
    </div>
  );
}
