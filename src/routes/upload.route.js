import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { uploadBuffer } from '../services/supabase.service.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/file',
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'file is required' });
      }
      const folder = req.body.folder || req.query.folder || '';
      const { buffer, mimetype, originalname } = req.file;
      const { publicUrl, path } = await uploadBuffer({ buffer, filename: originalname, contentType: mimetype, folder });
      res.json({ success: true, publicUrl, path });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/signed-url',
  express.json(),
  (req, res) => {
    res.status(410).json({ success: false, message: 'GCS signed uploads have been retired. Use POST /api/uploads/file with multipart/form-data instead.' });
  }
);

export default router;
