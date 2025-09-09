import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { put } from '@vercel/blob';

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// POST /upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'Blob token not configured' });
    }

    const fileId = uuidv4();
    const extension = path.extname(req.file.originalname);
    const filename = `${fileId}${extension}`;

    const { url } = await put(filename, req.file.buffer, {
      access: 'public',
      token,
    });

    const fileName = req.file.originalname;
    res.json({ fileId, fileName, blobUrl: url });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

export default router;