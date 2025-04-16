import multer from 'multer'
import path from 'path';

const storage = multer.memoryStorage(); // Store files in memory for Cloudinary upload

const fileFilter = (req: any, file: any, cb: any) => {
	console.log("filetype");
	const filetypes = /jpeg|jpg|png/;
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	const mimetype = filetypes.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null, true);
	} else {
		cb(new Error("Only images are allowed (jpeg, jpg, png)"));
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;