const multer      = require("multer");
const cloudinary  = require("../config/cloudinary");
const streamifier = require("streamifier");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg","image/png","image/gif","image/webp",
      "video/mp4","video/quicktime","video/avi","video/webm","video/x-matroska",
      "audio/mpeg","audio/mp3","audio/wav","audio/m4a","audio/ogg",
      "audio/webm","audio/mp4","audio/x-m4a",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Unsupported file type"), false);
  },
});

function uploadToCloudinary(buffer, mimetype, folder="happy-wisher/gifts") {
  return new Promise((resolve, reject) => {
    const isVideo = mimetype.startsWith("video/");
    const isAudio = mimetype.startsWith("audio/");
    const resourceType = (isVideo || isAudio) ? "video" : "image";
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        ...(isVideo ? { transformation: [{ duration: "600" }] } : {}),
        ...(isAudio ? { format: "mp3" } : {}),
        ...(!isVideo && !isAudio ? { transformation: [{ width: 1200, crop: "limit" }] } : {}),
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

module.exports = { upload, uploadToCloudinary };