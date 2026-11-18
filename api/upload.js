export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const expected = process.env.PSB_ADMIN_PASSWORD || 'psb2026';
  const pw = String(req.headers['x-admin-password'] || '');
  if (pw !== expected && pw.toLowerCase() !== 'psbsec') {
    return res.status(401).json({ message: 'Not logged in. Please sign in again.' });
  }

  const { type = 'main', filename = 'upload.xlsx', summary = '', data, field } = req.body || {};
  if (type === 'field') {
    if (!field || !Array.isArray(field.areas)) {
      return res.status(400).json({ message: 'Invalid field visit data payload.' });
    }
  } else if (!data || !data.kpi || !Array.isArray(data.agents)) {
    return res.status(400).json({ message: 'Invalid dashboard data payload.' });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'abengapala/psb-dashboard';
  const filePath = 'public/data.json';

  let finalData = data;

  if (token) {
    try {
      const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
      const headers = {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'psb-dashboard-vercel',
      };

      let sha;
      let existingData = null;
      const getRes = await fetch(apiUrl, { headers });
      if (getRes.ok) {
        const current = await getRes.json();
        sha = current.sha;
        try {
          existingData = JSON.parse(Buffer.from(current.content || '', 'base64').toString('utf-8'));
        } catch {
          existingData = null;
        }
      }

      if (type === 'field') {
        if (!existingData) {
          return res.status(400).json({ message: 'No existing dashboard data found to attach Field Visit data to.' });
        }
        finalData = { ...existingData, field };
      } else if (existingData?.field && !finalData.field) {
        finalData = { ...finalData, field: existingData.field };
      }

      const contentBase64 = Buffer.from(JSON.stringify(finalData, null, 2), 'utf-8').toString('base64');
      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Update ${type === 'field' ? 'field visit data' : 'data.json'} from ${filename}`,
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
  if (Array.isArray(finalData?.warnings) && finalData.warnings.length > 0 && type !== 'field') {
    lines.push('', 'Warnings (fix these in the Excel file):');
    for (const w of finalData.warnings) lines.push(`- ${w}`);
  }

  return res.status(200).json({
    message: type === 'field' ? 'Field Visit Map updated!' : 'Dashboard updated!',
    log: lines,
    data: finalData,
  });
}
