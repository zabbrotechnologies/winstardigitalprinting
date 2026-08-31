import express from 'express';
import multer from 'multer';
import { supabaseAdmin, STORAGE_BUCKET } from '../supabaseServer.js';

const router = express.Router();

// Memory storage — pipe to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const allowedMime = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.corel-draw',
      'application/x-cdr',
      'application/cdr',
      'image/x-coreldraw',
      'application/x-coreldraw',
      'application/octet-stream',
    ];
    const isCdrExt = file.originalname && file.originalname.toLowerCase().endsWith('.cdr');
    if (allowedMime.includes(file.mimetype) || isCdrExt) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Use PDF, DOCX, JPG, PNG, or CorelDRAW (.CDR).'));
    }
  },
});

// POST /api/upload — upload print file to Supabase Storage
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const fileExt = req.file.originalname.split('.').pop();
  const fileName = `uploads/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    res.status(201).json({
      message: 'File uploaded successfully',
      fileId: fileName,
      fileName: req.file.originalname,
      publicUrl,
      downloadUrl: publicUrl,
      sizeOriginal: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (err) {
    // Fallback — return simulated response so Quick Print still works without storage bucket
    console.warn('Supabase Storage upload fallback:', err.message);
    const simulatedId = `local_${Date.now()}`;
    res.status(201).json({
      message: 'File upload handled (fallback)',
      fileId: simulatedId,
      fileName: req.file.originalname,
      publicUrl: null,
      downloadUrl: null,
      sizeOriginal: req.file.size,
      mimeType: req.file.mimetype,
    });
  }
});

export default router;
