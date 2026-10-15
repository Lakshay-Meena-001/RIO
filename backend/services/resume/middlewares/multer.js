import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

const uploadPath = path.resolve(process.cwd(), "uploads");

const maxFileSizeMB = Number(process.env.RESUME_MAX_FILE_SIZE_MB ?? 10);

if (!Number.isInteger(maxFileSizeMB) || maxFileSizeMB <= 0) {
  throw new Error("RESUME_MAX_FILE_SIZE_MB must be a positive integer.");
}

// Ensure the upload directory exists before accepting uploads.
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadPath);
  },

  filename: (_req, _file, callback) => {
    // Never use user-supplied filenames for stored files.
    callback(null, `${crypto.randomUUID()}.pdf`);
  },
});

const fileFilter = (_req, file, callback) => {
  const originalName = path.basename(file.originalname || "");
  const extension = path.extname(originalName).toLowerCase();

  if (file.mimetype !== "application/pdf" || extension !== ".pdf") {
    const error = new Error("Only PDF files are allowed.");
    error.code = "INVALID_RESUME_FILE_TYPE";

    return callback(error);
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024,
    files: 1,
    fields: 10,
    parts: 11,
  },
});

export { upload };
