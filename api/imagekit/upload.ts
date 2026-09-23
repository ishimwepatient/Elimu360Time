// Vercel Serverless Function for ImageKit uploads
// Works seamlessly in production on Vercel and proxies requests safely with private API key.

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is accepted.' });
  }

  try {
    const { file, fileName, folder, tags } = req.body || {};

    if (!file) {
      return res.status(400).json({ error: 'Missing required file data' });
    }

    const privateKey =
      process.env.IMAGEKIT_PRIVATE_KEY ||
      process.env.PRIVATE_KEY ||
      process.env.VITE_IMAGEKIT_PRIVATE_KEY;

    const urlEndpoint =
      process.env.IMAGEKIT_URL_ENDPOINT ||
      process.env.URL_ENDPOINT ||
      process.env.VITE_IMAGEKIT_URL_ENDPOINT ||
      'https://ik.imagekit.io/elimu360';

    const cleanFolder = folder || '/elimu360/official_assets';
    const cleanFileName = fileName || `asset_${Date.now()}.png`;

    // 1. Direct ImageKit Upload via Official API if private key is present
    if (privateKey && !privateKey.includes('your_private_key') && privateKey.trim().length > 4) {
      try {
        const formData = new FormData();
        const base64Data = file.startsWith('data:') ? file.split(',')[1] : file;
        formData.append('file', base64Data);
        formData.append('fileName', cleanFileName);
        formData.append('folder', cleanFolder);
        if (tags && Array.isArray(tags)) {
          formData.append('tags', tags.join(','));
        }
        formData.append('useUniqueFileName', 'true');

        const authHeader = `Basic ${Buffer.from(`${privateKey.trim()}:`).toString('base64')}`;

        const ikRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          headers: {
            Authorization: authHeader
          },
          body: formData
        });

        if (ikRes.ok) {
          const ikData = (await ikRes.json()) as any;
          return res.status(200).json({
            success: true,
            url: ikData.url,
            fileId: ikData.fileId,
            name: ikData.name || cleanFileName,
            sizeBytes: ikData.size,
            thumbnailUrl: ikData.thumbnailUrl,
            provider: 'imagekit'
          });
        } else {
          const errorDetails = await ikRes.text();
          console.error('ImageKit API returned error:', errorDetails);
          return res.status(502).json({
            error: 'ImageKit upstream upload rejected',
            details: errorDetails
          });
        }
      } catch (ikError: any) {
        console.error('ImageKit fetch exception:', ikError);
        return res.status(500).json({
          error: 'ImageKit communication failure',
          message: ikError?.message
        });
      }
    }

    // 2. If no private key is set, return a descriptive error so the user knows to configure it
    return res.status(500).json({
      error: 'IMAGEKIT_PRIVATE_KEY environment variable is not configured on Vercel.',
      hint: 'Please add IMAGEKIT_PRIVATE_KEY and VITE_IMAGEKIT_URL_ENDPOINT to your Vercel Project Settings > Environment Variables.'
    });
  } catch (error: any) {
    console.error('Upload handler exception:', error);
    return res.status(500).json({
      error: 'Internal upload processing error',
      message: error?.message || 'Unknown error'
    });
  }
}
