/**
 * Storage abstraction — currently writes to local disk.
 * Swap the implementation to upload to S3/GCS without changing callers.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export interface StoredFile {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface StorageProvider {
  save(buffer: Buffer, mimeType: string, originalName: string): Promise<StoredFile>;
  delete(filename: string): Promise<void>;
  getUrl(filename: string): string;
}

export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly uploadDir: string) {}

  async save(buffer: Buffer, mimeType: string, originalName: string): Promise<StoredFile> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    const ext = path.extname(originalName) || mimeTypeToExt(mimeType);
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    return {
      filename,
      url: `/uploads/${filename}`,
      size: buffer.length,
      mimeType,
    };
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    await fs.unlink(filePath).catch(() => undefined);
  }

  getUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}

function mimeTypeToExt(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  return map[mimeType] ?? '.bin';
}

// Singleton factory — swap for S3Provider when ready
let _storage: StorageProvider | null = null;
export function getStorage(uploadDir: string): StorageProvider {
  if (!_storage) _storage = new LocalStorageProvider(uploadDir);
  return _storage;
}
