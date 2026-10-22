import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const config = {
  api: {
    responseLimit: false,
    bodyParser: false
  }
};

export const maxDuration = 60;

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Only GET is accepted.' });
  }

  try {
    const { url: targetUrl } = req.query || {};

    if (!targetUrl || typeof targetUrl !== 'string') {
      return res.status(400).send('Missing url parameter');
    }

    const CACHE_DIR = process.env.VERCEL ? '/tmp/.reb_cache' : path.resolve('.reb_cache');
    if (!fs.existsSync(CACHE_DIR)) {
      try { fs.mkdirSync(CACHE_DIR, { recursive: true }); } catch (_) {}
    }

    const urlHash = crypto.createHash('md5').update(targetUrl).digest('hex');
    const rawCachePath = path.join(CACHE_DIR, `raw_${urlHash}.pdf`);

    res.setHeader('Content-Type', 'application/pdf');

    // If disk cache has it, stream immediately with Content-Length
    if (fs.existsSync(rawCachePath)) {
      const stat = fs.statSync(rawCachePath);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('X-REB-Cache', 'HIT-RAW');
      const stream = fs.createReadStream(rawCachePath);
      return stream.pipe(res);
    }

    // Stream directly from REB eLearning
    const clientReq = https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*'
      },
      insecureHTTPParser: true,
      timeout: 55000
    }, (rebRes) => {
      if (rebRes.statusCode && rebRes.statusCode >= 400) {
        res.statusCode = rebRes.statusCode;
        return res.end(`REB server returned HTTP ${rebRes.statusCode}`);
      }

      if (rebRes.headers['content-length']) {
        res.setHeader('Content-Length', rebRes.headers['content-length']);
      }

      const chunks: Buffer[] = [];
      rebRes.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
        res.write(chunk);
      });

      rebRes.on('end', () => {
        const full = Buffer.concat(chunks);
        if (full.length > 500) {
          try { fs.writeFileSync(rawCachePath, full); } catch (_) {}
        }
        res.end();
      });
    });

    clientReq.on('timeout', () => {
      clientReq.destroy(new Error('REB connection timeout'));
    });

    clientReq.on('error', (err) => {
      res.statusCode = 502;
      res.end(err.message);
    });
  } catch (err: any) {
    res.statusCode = 500;
    res.end(err?.message || 'Server error streaming book');
  }
}
