import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true,
});

interface UploadResult {
	secure_url: string;
	public_id: string;
	[key: string]: any;
}

export const uploadToCloudinary = async (
	file: Express.Multer.File
): Promise<UploadResult> => {
	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			reject(new Error("Upload timed out"));
		}, 30000); // 30 seconds timeout

		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: "farmers-market",
				resource_type: "auto",
				allowed_formats: ["jpg", "jpeg", "png"],
				transformation: [
					{ width: 800, height: 600, crop: "limit" },
					{ quality: "auto" },
					{ fetch_format: "auto" },
				],
			},
			(error, result) => {
				clearTimeout(timeoutId); // Clear the timeout
				if (error) return reject(error);
				if (!result) return reject(new Error("Upload failed"));
				resolve(result);
			}
		);

		const readableStream = new Readable();
		readableStream._read = () => {};
		readableStream.push(file.buffer);
		readableStream.push(null);
		readableStream.pipe(uploadStream);
	});
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;