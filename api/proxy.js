export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const response = await fetch('https://scrapearfynkus-pq5dm7jerg-uc.a.run.app', {method: req.method, headers: {'Content-Type': 'application/json', ...req.headers}, body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined});
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({success: false, error: error.message});
  }
}
