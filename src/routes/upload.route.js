import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { uploadBuffer } from '../services/supabase.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

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
      console.error('Supabase upload failed:', err);
      return res.status(500).json({ success: false, message: err?.message || 'Upload failed' });
    }
  }
);

// Local upload: save file into src/public/uploads/<folder>/YYYY/MM/uuid.ext
router.post(
  '/local',
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'file is required' });
      }
      const folder = (req.body.folder || req.query.folder || 'videos').toString().replace(/[^a-z0-9-_\/]/gi, '');
      const now = new Date();
      const yyyy = String(now.getFullYear());
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const ext = (() => {
        const name = req.file.originalname || '';
        const dot = name.lastIndexOf('.');
        const e = dot !== -1 ? name.slice(dot + 1) : '';
        return (e || 'bin').toLowerCase().slice(0, 12);
      })();
      const id = uuidv4();
      // Resolve project root relative to this file
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const publicRoot = path.resolve(__dirname, '..', 'public');
      const relDir = path.join('uploads', folder, yyyy, mm);
      const absDir = path.join(publicRoot, relDir);
      await fs.promises.mkdir(absDir, { recursive: true });
      const filename = `${id}.${ext}`;
      const absPath = path.join(absDir, filename);
      await fs.promises.writeFile(absPath, req.file.buffer);
      // Build public URL path (served by express.static('src/public'))
      const publicUrl = '/' + path.posix.join('uploads', folder.replace(/\\/g, '/'), yyyy, mm, filename);
      return res.json({ success: true, publicUrl, path: publicUrl });
    } catch (err) {
      console.error('Local upload failed:', err);
      return res.status(500).json({ success: false, message: err?.message || 'Local upload failed' });
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
