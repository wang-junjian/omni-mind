import fs from 'fs/promises';
import path from 'path';
import { parseTextFile } from './text';
import { parseSpreadsheetFile } from './spreadsheet';
import { parseImageFile } from './image';
import { parseAudioFile } from './audio';
import { parseVideoFile } from './video';

export interface FileParseResult {
  content: string;
  metadata: Record<string, string>;
  mimeType: string;
}

export async function parseFile(filePath: string): Promise<FileParseResult> {
  const ext = path.extname(filePath).toLowerCase();
  const stats = await fs.stat(filePath);

  if (stats.isDirectory()) {
    throw new Error('Cannot parse directory');
  }

  switch (ext) {
    case '.txt':
    case '.md':
    case '.csv':
    case '.json':
    case '.xml':
    case '.html':
    case '.htm':
      return parseTextFile(filePath);
    case '.xls':
    case '.xlsx':
    case '.csv':
      return parseSpreadsheetFile(filePath);
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
    case '.bmp':
    case '.webp':
      return parseImageFile(filePath);
    case '.mp3':
    case '.wav':
    case '.flac':
    case '.aac':
    case '.ogg':
    case '.wma':
      return parseAudioFile(filePath);
    case '.mp4':
    case '.avi':
    case '.mkv':
    case '.mov':
    case '.wmv':
    case '.flv':
    case '.webm':
      return parseVideoFile(filePath);
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

export function getFileTypeFromExt(ext: string): string {
  ext = ext.toLowerCase();
  if (['.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm'].includes(ext)) return 'text';
  if (['.xls', '.xlsx'].includes(ext)) return 'spreadsheet';
  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) return 'image';
  if (['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma'].includes(ext)) return 'audio';
  if (['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'].includes(ext)) return 'video';
  return 'unknown';
}

export function getMimeTypeFromExt(ext: string): string {
  ext = ext.toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',
    '.ogg': 'audio/ogg',
    '.wma': 'audio/x-ms-wma',
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.mov': 'video/quicktime',
    '.wmv': 'video/x-ms-wmv',
    '.flv': 'video/x-flv',
    '.webm': 'video/webm',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
