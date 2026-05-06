export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const text = (req.query.text || '').trim().substring(0, 200);
  if (!text) return res.status(400).json({ error: 'No text' });
  const params = new URLSearchParams({
    ie: 'UTF-8', q: text, tl: 'en-GB',
    total: '1', idx: '0', textlen: String(text.length),
    client: 'tw-ob', ttsspeed: '0.87'
  });
  try {
    const resp = await fetch('https://translate.google.com/translate_tts?' + params.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    });
    if (!resp.ok) throw new Error('Google TTS ' + resp.status);
    const buf = Buffer.from(await resp.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
