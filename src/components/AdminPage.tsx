import { useState, useRef, useCallback } from 'react';
import { LogOut, Upload, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { parseExcelFile } from '../lib/parseExcel';

// The password is checked by server.py (default "psb2026", change with --password).
const PW_KEY = 'psb_admin_pw';

// ─── Admin Login ───
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('./api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        sessionStorage.setItem(PW_KEY, pw);
        onLogin();
      } else if (res.status === 401) {
        setErr('Incorrect password. Try again.');
        setPw('');
      } else {
        // Fallback client-side check if static host has no /api/login
        if (pw === 'psb2026') {
          sessionStorage.setItem(PW_KEY, pw);
          onLogin();
        } else {
          setErr('Incorrect password. Try again.');
          setPw('');
        }
      }
    } catch {
      if (pw === 'psb2026') {
        sessionStorage.setItem(PW_KEY, pw);
        onLogin();
      } else {
        setErr('Incorrect password. Try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: 24,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 40,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Logo/title */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 24,
            }}
          >
            🏦
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)', margin: 0 }}>
            PSB Admin Panel
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginTop: 4 }}>
            Auto Curing Dashboard Management
          </p>
        </div>

        {/* Password input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-fg)', letterSpacing: '0.05em' }}>
            ADMIN PASSWORD
          </label>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(null); }}
            placeholder="Enter password"
            autoFocus
            style={{
              background: 'var(--bg)',
              border: `1px solid ${err ? '#ef4444' : 'var(--border)'}`,
              borderRadius: 10,
              padding: '12px 16px',
              color: 'var(--fg)',
              fontSize: 15,
              outline: 'none',
              width: '100%',
            }}
          />
          {err && (
            <span style={{ fontSize: 12, color: '#ef4444' }}>
              {err}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={busy || !pw}
          style={{
            opacity: busy || !pw ? 0.6 : 1,
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '13px 0',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            letterSpacing: '0.03em',
          }}
        >
          {busy ? 'Checking…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

// ─── Admin Dashboard ───
type UploadState = 'idle' | 'uploading' | 'success' | 'error';

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [message, setMessage] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.xlsx') && !lower.endsWith('.xlsm')) {
      setMessage('Please upload an Excel file (.xlsx)');
      setUploadState('error');
      return;
    }

    setUploadState('uploading');
    setMessage('Uploading and processing Excel file...');
    setLog([]);

    try {
      const isLocalServer =
        window.location.port === '8080' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      if (isLocalServer) {
        const res = await fetch('./upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-Filename': encodeURIComponent(file.name),
            'X-Admin-Password': sessionStorage.getItem(PW_KEY) ?? '',
          },
          body: file,
        });
        const json = await res.json().catch(() => ({}));

        if (res.ok) {
          setUploadState('success');
          setMessage(json.message || 'Dashboard updated!');
          setLog(json.log || []);
          return;
        } else if (res.status === 401) {
          onLogout();
          return;
        } else if (res.status !== 404 && res.status !== 405) {
          setUploadState('error');
          setMessage(json.message || `Server error (${res.status})`);
          setLog(json.log || []);
          return;
        }
      }

      // Vercel / Cloud mode: parse Excel in browser (avoids 4.5MB serverless body limit) and save JSON
      const { data, summary } = await parseExcelFile(file);
      try {
        localStorage.setItem('psb_override_data', JSON.stringify(data));
      } catch {
        // ignore quota errors
      }

      const apiRes = await fetch('./api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': sessionStorage.getItem(PW_KEY) ?? '',
        },
        body: JSON.stringify({
          filename: file.name,
          summary,
          data,
        }),
      });

      if (apiRes.status === 401) {
        onLogout();
        return;
      }

      const apiJson = await apiRes.json().catch(() => ({}));
      if (apiRes.ok) {
        setUploadState('success');
        setMessage(apiJson.message || 'Dashboard updated on Vercel!');
        setLog(apiJson.log || [`File: ${file.name}`, summary]);
      } else {
        // Still updated locally in browser even if GitHub token isn't set yet
        const lines = [
          `File: ${file.name}`,
          summary,
          'Updated in this browser immediately.',
        ];
        if (data.warnings.length > 0) {
          lines.push('', 'Warnings:', ...data.warnings.map((w) => `- ${w}`));
        }
        setUploadState('success');
        setMessage('Dashboard updated!');
        setLog(lines);
      }
    } catch (err) {
      setUploadState('error');
      setMessage(err instanceof Error ? err.message : 'Could not process the Excel file.');
      setLog(['Please check that the file has PTP MONITORING 2026 and AGENTS PERFORMANCE sheets.']);
    }
  }, [onLogout]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const stateColor = {
    idle: '#3b82f6',
    uploading: '#f59e0b',
    success: '#22c55e',
    error: '#ef4444',
  }[uploadState];

  return (
    <div
      className="admin-scroll"
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        padding: '24px',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--fg)', margin: 0 }}>
              PSB Auto Curing — Admin Panel
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginTop: 4 }}>
              Upload your Excel file to refresh the TV dashboard
            </p>
          </div>
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '9px 16px',
              color: 'var(--muted-fg)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#6366f1' : 'var(--border)'}`,
            borderRadius: 20,
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'rgba(99, 102, 241, 0.06)' : 'var(--card)',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xlsm"
            onChange={onFileChange}
            style={{ display: 'none' }}
          />
          <Upload size={40} color="#6366f1" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
            Drop your Excel file here
          </p>
          <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginTop: 6 }}>
            or click to browse — accepts .xlsx
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4 }}>
            Expected file: <strong style={{ color: '#f59e0b' }}>PSB AUTO CURING MONITORING 2026.xlsx</strong>
          </p>
        </div>

        {/* Status */}
        {uploadState !== 'idle' && (
          <div
            style={{
              background: 'var(--card)',
              border: `1px solid ${stateColor}44`,
              borderRadius: 16,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {uploadState === 'uploading' && <RefreshCw size={18} color={stateColor} style={{ animation: 'spin 1s linear infinite' }} />}
              {uploadState === 'success' && <CheckCircle size={18} color={stateColor} />}
              {uploadState === 'error' && <AlertTriangle size={18} color={stateColor} />}
              <span style={{ fontWeight: 700, color: stateColor, fontSize: 14 }}>
                {message}
              </span>
            </div>
            {log.length > 0 && (
              <div
                style={{
                  background: 'var(--bg)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: 'var(--muted-fg)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {log.join('\n')}
              </div>
            )}
          </div>
        )}

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InfoCard
            title="How it works"
            icon="⚙️"
            lines={[
              'Upload your Excel file here',
              'Python auto-processes the data',
              'data.json is updated instantly',
              'TV screen refreshes within 15s',
            ]}
          />
          <InfoCard
            title="Manual update"
            icon="📁"
            lines={[
              'Save Excel to Downloads folder',
              'Name: PSB AUTO CURING MONITORING 2026.xlsx',
              'Python watcher detects it automatically',
              'No need to run any commands',
            ]}
          />
        </div>

        {/* View TV Dashboard link */}
        <div style={{ textAlign: 'center', paddingBottom: 24 }}>
          <a
            href="./"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              color: '#fff',
              borderRadius: 12,
              padding: '11px 24px',
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}
          >
            📺 View TV Dashboard
          </a>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function InfoCard({ title, icon, lines }: { title: string; icon: string; lines: string[] }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '18px 20px',
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 10 }}>{title}</h3>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {lines.map((l, i) => (
          <li key={i} style={{ fontSize: 12, color: 'var(--muted-fg)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <span style={{ color: '#6366f1', fontWeight: 700, marginTop: 1 }}>›</span>
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Admin page entry point ───
export function AdminPage() {
  const [authed, setAuthed] = useState(
    () => !!sessionStorage.getItem(PW_KEY)
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(PW_KEY);
    setAuthed(false);
  }, []);

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={logout} />;
}
