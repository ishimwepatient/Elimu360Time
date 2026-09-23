import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const privateKey =
      process.env.IMAGEKIT_PRIVATE_KEY ||
      process.env.PRIVATE_KEY ||
      process.env.VITE_IMAGEKIT_PRIVATE_KEY;

    if (!privateKey || privateKey.includes('your_private_key')) {
      return res.status(500).json({ error: 'IMAGEKIT_PRIVATE_KEY is not configured.' });
    }

    const token = req.query.token || crypto.randomUUID();
    const expire = req.query.expire || Math.floor(Date.now() / 1000) + 2400; // 40 minutes

    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(token + expire)
      .digest('hex');

    return res.status(200).json({
      token,
      expire,
      signature
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate ImageKit auth parameters', details: err?.message });
  }
}
