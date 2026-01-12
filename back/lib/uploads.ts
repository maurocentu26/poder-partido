import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { nanoid } from 'nanoid';

const MAX_BYTES = 5 * 1024 * 1024;

export async function saveUploadedImage(file: File) {
  if (!file || file.size === 0) {
    throw new Error('Archivo vacío.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Solo se permiten imágenes.');
  }

  if (file.size > MAX_BYTES) {
    throw new Error('La imagen supera 5MB.');
  }

  const ext = path.extname(file.name || '').toLowerCase();
  const safeExt = ext && ext.length <= 10 ? ext : '';
  const filename = `${nanoid(10)}${safeExt}`;

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const fullPath = path.join(uploadDir, filename);
  await writeFile(fullPath, Buffer.from(bytes));

  return {
    url: `/uploads/${filename}`,
    filename,
  };
}
