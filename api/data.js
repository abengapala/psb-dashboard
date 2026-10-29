export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const repo = process.env.GITHUB_REPO || 'abengapala/psb-dashboard';
  const token = process.env.GITHUB_TOKEN;

  try {
    const headers = { 'User-Agent': 'psb-dashboard-vercel' };
    if (token) {
      headers.Authorization = `token ${token}`;
      headers.Accept = 'application/vnd.github.v3.raw';
      const ghRes = await fetch(
        `https://api.github.com/repos/${repo}/contents/public/data.json`,
        { headers, cache: 'no-store' },
      );
      if (ghRes.ok) {
        const text = await ghRes.text();
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(text);
      }
    }

    const rawRes = await fetch(
      `https://raw.githubusercontent.com/${repo}/main/public/data.json?t=${Date.now()}`,
      { cache: 'no-store' },
    );
    if (rawRes.ok) {
      const text = await rawRes.text();
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(text);
    }
  } catch {
    // Fallback to static data.json handled by client
  }

  return res.status(404).json({ message: 'Fallback to static data.json' });
}
