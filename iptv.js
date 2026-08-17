export default async function handler(req, res) {
  const host = process.env.XTREAM_HOST;
  const username = process.env.XTREAM_USERNAME;
  const password = process.env.XTREAM_PASSWORD;

  if (!host || !username || !password) {
    return res.status(500).json({ error: 'Xtream environment variables are not configured.' });
  }

  const base = host.replace(/\/$/, '');
  const q = new URL(req.url, `https://${req.headers.host}`).searchParams;
  const mode = q.get('mode');

  try {
    if (mode === 'stream') {
      const type = q.get('type') === 'series' ? 'series' : 'movie';
      const id = q.get('id');
      const ext = (q.get('ext') || 'mp4').replace(/[^a-zA-Z0-9]/g, '') || 'mp4';
      if (!id) return res.status(400).send('Missing stream id');
      const path = type === 'movie' ? 'movie' : 'series';
      const upstream = await fetch(`${base}/${path}/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${encodeURIComponent(id)}.${ext}`, { redirect: 'manual' });
      if (upstream.status >= 300 && upstream.status < 400) {
        const location = upstream.headers.get('location');
        if (location) return res.redirect(302, location);
      }
      if (!upstream.ok) return res.status(upstream.status).send('Upstream stream unavailable');
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'video/mp4');
      const len = upstream.headers.get('content-length');
      if (len) res.setHeader('Content-Length', len);
      const range = upstream.headers.get('accept-ranges');
      if (range) res.setHeader('Accept-Ranges', range);
      const buffer = Buffer.from(await upstream.arrayBuffer());
      return res.status(200).send(buffer);
    }

    const action = q.get('action');
    if (!action) return res.status(400).json({ error: 'Missing action' });
    const allowed = new Set([
      'get_vod_categories','get_series_categories','get_vod_streams','get_series','get_series_info'
    ]);
    if (!allowed.has(action)) return res.status(400).json({ error: 'Action not allowed' });

    const params = new URLSearchParams({ username, password, action });
    for (const [key, value] of q.entries()) {
      if (key !== 'action' && key !== 'mode') params.set(key, value);
    }
    const upstream = await fetch(`${base}/player_api.php?${params.toString()}`);
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (err) {
    console.error('Xtream proxy error:', err);
    return res.status(502).json({ error: 'Could not connect to the Xtream server.' });
  }
}
