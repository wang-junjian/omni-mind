import fs from 'fs/promises';
import path from 'path';
import { FileParseResult, getMimeTypeFromExt } from './index';

export async function parseTextFile(filePath: string): Promise<FileParseResult> {
  const ext = path.extname(filePath).toLowerCase();
  const content = await fs.readFile(filePath, 'utf-8');
  const stats = await fs.stat(filePath);

  return {
    content,
    metadata: {
      size: stats.size.toString(),
      lastModified: stats.mtime.toISOString(),
      encoding: 'utf-8',
      fileExtension: ext,
    },
    mimeType: getMimeTypeFromExt(ext),
  };
}
