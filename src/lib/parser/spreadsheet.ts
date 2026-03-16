import fs from 'fs/promises';
import path from 'path';
import * as XLSX from 'xlsx';
import { FileParseResult, getMimeTypeFromExt } from './index';

export async function parseSpreadsheetFile(filePath: string): Promise<FileParseResult> {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = await fs.readFile(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const stats = await fs.stat(filePath);

  let content = '';
  const metadata: Record<string, string> = {
    size: stats.size.toString(),
    lastModified: stats.mtime.toISOString(),
    sheetCount: workbook.SheetNames.length.toString(),
    sheets: workbook.SheetNames.join(', '),
  };

  // 转换所有工作表为文本
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    content += `=== Sheet: ${sheetName} ===\n${csv}\n\n`;

    // 统计行数和列数
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    metadata[`${sheetName}_rows`] = (range.e.r + 1).toString();
    metadata[`${sheetName}_cols`] = (range.e.c + 1).toString();
  }

  return {
    content,
    metadata,
    mimeType: getMimeTypeFromExt(ext),
  };
}
