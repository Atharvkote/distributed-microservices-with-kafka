import cloudinary from "../configs/cloudinary.config.js";

/**
 * Uploads an image buffer to Cloudinary
 *
 * @param {Buffer} buffer - File buffer from multer
 * @param {Object} options
 * @param {string} options.folder - Cloudinary folder path
 * @param {string} options.publicId - Deterministic public_id
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const cloudinaryUpload = (
  buffer,
  { folder, publicId }
) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
        transformation: [
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(buffer);
  });
};
