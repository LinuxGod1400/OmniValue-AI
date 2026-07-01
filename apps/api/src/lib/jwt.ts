import jwt from 'jsonwebtoken';

export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string; // token id stored in DB
  type: 'refresh';
}

export function signAccessToken(
  payload: Omit<AccessTokenPayload, 'type'>,
  secret: string,
  expiresIn: string,
): string {
  return jwt.sign({ ...payload, type: 'access' }, secret, { expiresIn } as jwt.SignOptions);
}

export function signRefreshToken(
  payload: Omit<RefreshTokenPayload, 'type'>,
  secret: string,
  expiresIn: string,
): string {
  return jwt.sign({ ...payload, type: 'refresh' }, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyAccessToken(token: string, secret: string): AccessTokenPayload {
  const decoded = jwt.verify(token, secret) as AccessTokenPayload;
  if (decoded.type !== 'access') throw new Error('Invalid token type');
  return decoded;
}

export function verifyRefreshToken(token: string, secret: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, secret) as RefreshTokenPayload;
  if (decoded.type !== 'refresh') throw new Error('Invalid token type');
  return decoded;
}
