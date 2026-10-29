export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const expected = process.env.PSB_ADMIN_PASSWORD || 'psb2026';
  const pw = req.headers['x-admin-password'] || '';
  if (pw !== expected) {
    return res.status(401).json({ message: 'Not logged in. Please sign in again.' });
  }

  const { filename = 'upload.xlsx', summary = '', data } = req.body || {};
  if (!data || !data.kpi || !Array.isArray(data.agents)) {
    return res.status(400).json({ message: 'Invalid dashboard data payload.' });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'abengapala/psb-dashboard';
  const filePath = 'public/data.json';

  if (token) {
    try {
      const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
      const headers = {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'psb-dashboard-vercel',
      };

      let sha;
      const getRes = await fetch(apiUrl, { headers });
      if (getRes.ok) {
        const current = await getRes.json();
        sha = current.sha;
      }

      const contentBase64 = Buffer.from(JSON.stringify(data, null, 2), 'utf-8').toString('base64');
      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Update data.json from ${filename}`,
          content: contentBase64,
          ...(sha ? { sha } : {}),
        }),
      });

      if (!putRes.ok) {
        const errText = await putRes.text();
        return res.status(500).json({
          message: 'Failed to save update to GitHub repository.',
          log: [errText],
        });
      }
    } catch (err) {
      return res.status(500).json({
        message: 'Error saving update to cloud storage.',
        log: [String(err)],
      });
    }
  }

  const lines = [
    `File: ${filename}`,
    summary || 'Dashboard data parsed and saved.',
    'TV screen will update within 15 seconds.',
  ];
  if (Array.isArray(data.warnings) && data.warnings.length > 0) {
    lines.push('', 'Warnings (fix these in the Excel file):');
    for (const w of data.warnings) lines.push(`- ${w}`);
  }

  return res.status(200).json({
    message: 'Dashboard updated!',
    log: lines,
    data,
  });
}
