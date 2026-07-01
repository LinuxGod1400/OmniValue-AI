import { type Request, type Response, type NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';
import { loadApiEnv } from '../env.js';

const env = loadApiEnv();

export interface AuthRequest extends Request {
  userId: string;
  userEmail: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing authorization header' } });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token, env.JWT_SECRET);
    (req as AuthRequest).userId = payload.sub;
    (req as AuthRequest).userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
}
