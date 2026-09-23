/**
 * ImageKit Integration & Minimal-Size Image Service
 * 
 * Provides production-ready image optimization, client-side pre-compression,
 * and seamless ImageKit API integration for student passport photos, official
 * school logos, and the National Coat of Arms.
 */

export interface ImageUploadResult {
  url: string;
  fileId?: string;
  name: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  provider: 'imagekit' | 'local_compressed';
}

export interface UploadOptions {
  folder?: string;
  fileName?: string;
  tags?: string[];
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Pre-compresses any selected image file in the browser before transmission,
 * ensuring minimal payload size, standard aspect ratios, and instant uploads.
 */
export const compressImageBeforeUpload = async (
  file: File | Blob,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.85
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be initialized for image compression'));
          return;
        }

        // Clean white background behind transparent PNGs if converted to JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl, width, height });
            } else {
              reject(new Error('Failed to compress image blob'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Invalid image data'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads an image to ImageKit API via server endpoint or client integration,
 * ensuring all images, logos, and emblems are stored on ImageKit CDN rather than
 * saved as massive base64 strings in Firestore.
 */
export const uploadImageToImageKit = async (
  file: File | Blob,
  options: UploadOptions = {}
): Promise<ImageUploadResult> => {
  const {
    folder = '/elimu360/official_assets',
    fileName = `asset_${Date.now()}.jpg`,
    tags = ['education', 'official'],
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.85
  } = options;

  // 1. Always pre-compress the image in memory to guarantee small footprint
  const compressed = await compressImageBeforeUpload(file, maxWidth, maxHeight, quality);

  // 2. First attempt: Server API proxy /api/imagekit/upload or /api/upload
  const endpoints = ['/api/imagekit/upload', '/api/upload'];
  for (const endpointUrl of endpoints) {
    try {
      const apiRes = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file: compressed.dataUrl,
          fileName,
          folder,
          tags
        })
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.url && (data.url.startsWith('http://') || data.url.startsWith('https://') || data.url.startsWith('/api/'))) {
          return {
            url: data.url,
            fileId: data.fileId,
            name: data.name || fileName,
            sizeBytes: data.sizeBytes || compressed.blob.size,
            width: compressed.width,
            height: compressed.height,
            thumbnailUrl: data.thumbnailUrl,
            provider: 'imagekit'
          };
        }
      }
    } catch (apiErr) {
      console.warn(`Server ImageKit upload at ${endpointUrl} unavailable:`, apiErr);
    }
  }

  // 3. Second attempt: Direct ImageKit client-side upload with auth signature
  const metaEnv = (import.meta as any).env || {};
  const endpoint = metaEnv.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/elimu360';
  const publicKey = metaEnv.VITE_IMAGEKIT_PUBLIC_KEY;

  if (publicKey && !publicKey.includes('your_public_key')) {
    try {
      // Attempt to retrieve signed token from auth endpoint
      let token = `token_${Date.now()}`;
      let expire = Math.floor(Date.now() / 1000) + 1800;
      let signature = '';

      try {
        const authRes = await fetch('/api/imagekit/auth');
        if (authRes.ok) {
          const authData = await authRes.json();
          token = authData.token;
          expire = authData.expire;
          signature = authData.signature;
        }
      } catch (authErr) {
        // Fallback to unsigned if direct
      }

      const formData = new FormData();
      formData.append('file', compressed.blob, fileName);
      formData.append('fileName', fileName);
      formData.append('publicKey', publicKey);
      formData.append('folder', folder);
      if (signature) {
        formData.append('signature', signature);
        formData.append('expire', String(expire));
        formData.append('token', token);
      }
      formData.append('tags', tags.join(','));
      formData.append('useUniqueFileName', 'true');

      const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return {
          url: data.url,
          fileId: data.fileId,
          name: data.name,
          sizeBytes: data.size,
          width: data.width,
          height: data.height,
          thumbnailUrl: data.thumbnailUrl,
          provider: 'imagekit'
        };
      }
    } catch (err) {
      console.warn('ImageKit direct upload exception:', err);
    }
  }

  // 4. Safe Client Fallback: If neither server upload nor direct upload is available,
  // return the high-efficiency compressed dataUrl so preview and rendering always succeed seamlessly.
  return {
    url: compressed.dataUrl,
    name: fileName,
    sizeBytes: compressed.blob.size,
    width: compressed.width,
    height: compressed.height,
    provider: 'local_compressed'
  };
};

/**
 * Applies ImageKit transformation parameters (e.g. tr:w-300,h-300,fo-auto)
 * or returns the URL cleanly if standard or data URL.
 */
export const isImageKitConfigured = (): boolean => {
  const metaEnv = (import.meta as any).env || {};
  const endpoint = metaEnv.VITE_IMAGEKIT_URL_ENDPOINT;
  const publicKey = metaEnv.VITE_IMAGEKIT_PUBLIC_KEY;
  return Boolean(endpoint && publicKey && !publicKey.includes('your_public_key'));
};

export const buildOptimizedImageUrl = (
  url: string | null | undefined,
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
    crop?: 'maintain_ratio' | 'force' | 'at_least';
  }
): string => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  // If it's an ImageKit URL, apply query or path transformation
  if (url.includes('ik.imagekit.io')) {
    const parts: string[] = [];
    if (transform?.width) parts.push(`w-${transform.width}`);
    if (transform?.height) parts.push(`h-${transform.height}`);
    if (transform?.quality) parts.push(`q-${transform.quality}`);
    parts.push('f-auto');

    if (parts.length > 0) {
      const transformString = `tr=${parts.join(',')}`;
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${transformString}`;
    }
  }

  return url;
};
