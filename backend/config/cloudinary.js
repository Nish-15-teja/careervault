import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Determine if Cloudinary credentials are set in our environment config
const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary media engine configured.');
} else {
  console.log('No Cloudinary credentials in .env. Running on local media mode.');
}

// Upload file wrapper: handles both Cloudinary uploads and local disk fallbacks
export const uploadToCloudinary = async (localFilePath) => {
  if (!isConfigured) {
    // Local storage fallback: convert local path to web accessible URL
    const filename = localFilePath.replace(/\\/g, '/').split('/').pop();
    return {
      secure_url: `http://localhost:5000/uploads/${filename}`,
      public_id: filename // Use the filename as a local replacement for the Cloudinary ID
    };
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: 'careervault/resumes',
      resource_type: 'raw' // 'raw' mode is required for storing PDF documents
    });
    
    // Clean up local temp file once safely uploaded to Cloudinary
    fs.unlinkSync(localFilePath);
    return {
      secure_url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    throw new Error(`Cloudinary service error: ${error.message}`);
  }
};

// Delete file wrapper: deletes from the cloud or local disk
export const deleteFromCloudinary = async (publicId) => {
  if (!isConfigured) {
    // Delete local file from disk
    const localFilePath = `uploads/${publicId}`;
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return { result: 'ok' };
  }

  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    console.error(`Failed to delete asset from Cloudinary: ${error.message}`);
    return { result: 'error' };
  }
};
export { isConfigured as isCloudinaryConfigured };
