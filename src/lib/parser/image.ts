import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { FileParseResult, getMimeTypeFromExt } from './index';

export async function parseImageFile(filePath: string): Promise<FileParseResult> {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath, ext);
  const dirname = path.basename(path.dirname(filePath));
  const stats = await fs.stat(filePath);

  try {
    const metadata = await sharp(filePath).metadata();

    const content = `图片：${filename}
分类：${dirname}
宽度：${metadata.width || '未知'}px
高度：${metadata.height || '未知'}px
格式：${metadata.format || ext.substring(1)}
大小：${(stats.size / 1024 / 1024).toFixed(2)}MB
拍摄时间：${metadata.exif?.DateTimeOriginal || '未知'}
相机型号：${metadata.exif?.Model || '未知'}
地理位置：${metadata.exif?.GPSLatitude ? '有' : '无'}
`;

    return {
      content,
      metadata: {
        size: stats.size.toString(),
        lastModified: stats.mtime.toISOString(),
        width: (metadata.width || 0).toString(),
        height: (metadata.height || 0).toString(),
        format: metadata.format || ext.substring(1),
        orientation: (metadata.orientation || 1).toString(),
        hasExif: metadata.exif ? 'true' : 'false',
      },
      mimeType: getMimeTypeFromExt(ext),
    };
  } catch (error) {
    console.warn('Error parsing image metadata:', error);
    // 如果解析失败，返回基础信息
    const content = `图片：${filename}
分类：${dirname}
大小：${(stats.size / 1024 / 1024).toFixed(2)}MB
`;

    return {
      content,
      metadata: {
        size: stats.size.toString(),
        lastModified: stats.mtime.toISOString(),
      },
      mimeType: getMimeTypeFromExt(ext),
    };
  }
}
