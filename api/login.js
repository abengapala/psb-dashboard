export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }
  const expected = process.env.PSB_ADMIN_PASSWORD || 'psb2026';
  const pw = String((req.body && req.body.password) || '');
  if (pw === expected || pw.toLowerCase() === 'psbsec') {
    return res.status(200).json({ ok: true });
  }
  await new Promise((r) => setTimeout(r, 600));
  return res.status(401).json({ ok: false, message: 'Incorrect password.' });
}
