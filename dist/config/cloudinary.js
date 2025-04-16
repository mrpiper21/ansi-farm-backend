"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_SECRETE,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error("Upload timed out"));
        }, 30000); // 30 seconds timeout
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: "farmers-market",
            resource_type: "auto",
            allowed_formats: ["jpg", "jpeg", "png"],
            transformation: [
                { width: 800, height: 600, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" },
            ],
        }, (error, result) => {
            clearTimeout(timeoutId); // Clear the timeout
            if (error)
                return reject(error);
            if (!result)
                return reject(new Error("Upload failed"));
            resolve(result);
        });
        const readableStream = new stream_1.Readable();
        readableStream._read = () => { };
        readableStream.push(file.buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    await cloudinary_1.v2.uploader.destroy(publicId);
};
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.default = cloudinary_1.v2;
