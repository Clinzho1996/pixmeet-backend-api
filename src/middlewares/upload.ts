import fs from "fs";
import multer from "multer";
import path from "path";

const uploadPath = "uploads/";

// 🔥 auto-create folder if not exists
if (!fs.existsSync(uploadPath)) {
	fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadPath);
	},

	filename: (req, file, cb) => {
		const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

		cb(null, uniqueName + path.extname(file.originalname));
	},
});

export const upload = multer({ storage });
