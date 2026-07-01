import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { getStorage } from '../lib/storage.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { loadApiEnv } from '../env.js';

const env = loadApiEnv();
export const uploadsRouter = Router();
uploadsRouter.use(requireAuth);

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  },
});

// POST /api/v1/uploads
uploadsRouter.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'No file uploaded' } });
    return;
  }

  const { userId } = req as unknown as AuthRequest;
  const storage = getStorage(env.UPLOAD_DIR);
  const stored = await storage.save(req.file.buffer, req.file.mimetype, req.file.originalname);

  const image = await prisma.image.create({
    data: {
      userId,
      filename: stored.filename,
      mimeType: stored.mimeType,
      size: stored.size,
      url: stored.url,
      itemId: typeof req.body['itemId'] === 'string' ? req.body['itemId'] : null,
    },
  });

  res.status(201).json({ success: true, data: image });
});

// DELETE /api/v1/uploads/:id
uploadsRouter.delete('/:id', async (req, res) => {
  const { userId } = req as unknown as AuthRequest;
  const image = await prisma.image.findFirst({ where: { id: req.params['id'], userId } });
  if (!image) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Image not found' } });
    return;
  }

  const storage = getStorage(env.UPLOAD_DIR);
  await storage.delete(image.filename);
  await prisma.image.delete({ where: { id: image.id } });

  res.json({ success: true, data: { message: 'Image deleted' } });
});
