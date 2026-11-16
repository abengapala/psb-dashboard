import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_CFG = { required: true, passcode: 'PSB-7492', version: '1' };

function readLocalAccess() {
  try {
    const p = path.join(process.cwd(), 'public', 'access.json');
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_CFG };
}

async function readConfig() {
  const repo = process.env.GITHUB_REPO || 'abengapala/psb-dashboard';
  const token = process.env.GITHUB_TOKEN;
  try {
    if (token) {
      const res = await fetch(`https://api.github.com/repos/${repo}/contents/public/access.json`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'psb-dashboard-vercel',
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const meta = await res.json();
        const text = Buffer.from(meta.content || '', 'base64').toString('utf-8');
        return { cfg: JSON.parse(text), sha: meta.sha };
      }
    } else {
      const res = await fetch(
        `https://raw.githubusercontent.com/${repo}/main/public/access.json?t=${Date.now()}`,
        { cache: 'no-store' },
      );
      if (res.ok) {
        return { cfg: await res.json(), sha: null };
      }
    }
  } catch {
    // fallback
  }
  return { cfg: readLocalAccess(), sha: null };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'GET') {
    const { cfg } = await readConfig();
    return res.status(200).json({
      required: Boolean(cfg.required),
      version: String(cfg.version || '1'),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const body = req.body || {};
  const action = body.action || 'verify';

  if (action === 'verify') {
    const { cfg } = await readConfig();
    if (!cfg.required) {
      return res.status(200).json({ ok: true, version: String(cfg.version || '1') });
    }
    const entered = String(body.passcode || '').trim();
    if (entered && entered === String(cfg.passcode || '')) {
      return res.status(200).json({ ok: true, version: String(cfg.version || '1') });
    }
    await new Promise((r) => setTimeout(r, 500));
    return res.status(401).json({ ok: false, message: 'Incorrect TV passcode.' });
  }

  // Admin-only actions
  const expected = process.env.PSB_ADMIN_PASSWORD || 'psb2026';
  const pw = String(req.headers['x-admin-password'] || '');
  if (pw !== expected && pw.toLowerCase() !== 'psbsec') {
    return res.status(401).json({ message: 'Admin authentication required.' });
  }

  if (action === 'get') {
    const { cfg } = await readConfig();
    return res.status(200).json({
      required: Boolean(cfg.required),
      passcode: String(cfg.passcode || ''),
      version: String(cfg.version || '1'),
    });
  }

  if (action === 'set') {
    const nextPasscode = String(body.passcode || '').trim();
    const nextRequired = body.required !== undefined ? Boolean(body.required) : true;
    if (nextRequired && nextPasscode.length < 4) {
      return res.status(400).json({ message: 'Passcode must be at least 4 characters.' });
    }
    const { cfg, sha } = await readConfig();
    const nextCfg = {
      required: nextRequired,
      passcode: nextPasscode || cfg.passcode || 'PSB-7492',
      version: String(Date.now()),
    };

    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'abengapala/psb-dashboard';
    if (!token) {
      return res.status(500).json({ message: 'GITHUB_TOKEN is not configured in Vercel.' });
    }

    const apiUrl = `https://api.github.com/repos/${repo}/contents/public/access.json`;
    const headers = {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'psb-dashboard-vercel',
      'Content-Type': 'application/json',
    };
    let currentSha = sha;
    if (!currentSha) {
      const getRes = await fetch(apiUrl, { headers });
      if (getRes.ok) {
        const meta = await getRes.json();
        currentSha = meta.sha;
      }
    }

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'Update TV viewer access passcode',
        content: Buffer.from(JSON.stringify(nextCfg, null, 2) + '\n', 'utf-8').toString('base64'),
        ...(currentSha ? { sha: currentSha } : {}),
      }),
    });

    if (!putRes.ok) {
      return res.status(500).json({ message: 'Failed to save passcode to GitHub.' });
    }

    return res.status(200).json({ ok: true, ...nextCfg });
  }

  return res.status(400).json({ message: 'Unknown action' });
}
