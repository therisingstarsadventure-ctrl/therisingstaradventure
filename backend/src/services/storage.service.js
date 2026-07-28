import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger.js';

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info('Cloudinary storage initialized.');
} else {
  logger.warn('Cloudinary not configured — file uploads will be URL-only.');
}

/**
 * Upload an image from a base64 data URI or remote URL.
 * @param {string} source - data URI or URL
 * @param {string} folder - Cloudinary folder path
 * @param {object} options - extra cloudinary upload options
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadImage = async (source, folder = 'therisingstars', options = {}) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // Pass-through if Cloudinary not configured
    return { url: source, publicId: null };
  }

  try {
    const result = await cloudinary.uploader.upload(source, {
      folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    });

    return { url: result.secure_url, publicId: result.public_id };
  } catch (err) {
    logger.error(`Cloudinary upload failed: ${err.message}`);
    throw new Error(`Image upload failed: ${err.message}`);
  }
};

/**
 * Generate a signed upload URL for direct frontend uploads.
 */
export const generateSignedUploadUrl = (folder = 'therisingstars') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return null;

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  };
};

/**
 * Delete an image from Cloudinary by public ID.
 */
export const deleteImage = async (publicId) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.error(`Cloudinary delete failed: ${err.message}`);
  }
};
