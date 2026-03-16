import fs from 'fs/promises';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { FileParseResult, getMimeTypeFromExt } from './index';

const ffprobe = promisify(ffmpeg.ffprobe);

export async function parseAudioFile(filePath: string): Promise<FileParseResult> {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath, ext);
  const dirname = path.basename(path.dirname(filePath));
  const stats = await fs.stat(filePath);

  try {
    const metadata = await ffprobe(filePath);
    const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

    const duration = metadata.format.duration ?
      `${Math.floor(metadata.format.duration / 60)}:${Math.floor(metadata.format.duration % 60).toString().padStart(2, '0')}` :
      '未知';

    const content = `音频：${filename}
专辑/分类：${dirname}
时长：${duration}
比特率：${metadata.format.bit_rate ? `${Math.round(metadata.format.bit_rate / 1000)} kbps` : '未知'}
采样率：${audioStream?.sample_rate ? `${audioStream.sample_rate} Hz` : '未知'}
声道：${audioStream?.channels || '未知'}
格式：${metadata.format.format_name || ext.substring(1)}
大小：${(stats.size / 1024 / 1024).toFixed(2)}MB
艺术家：${metadata.format.tags?.artist || '未知'}
标题：${metadata.format.tags?.title || filename}
专辑：${metadata.format.tags?.album || dirname}
年代：${metadata.format.tags?.date || '未知'}
`;

    return {
      content,
      metadata: {
        size: stats.size.toString(),
        lastModified: stats.mtime.toISOString(),
        duration: (metadata.format.duration || 0).toString(),
        bitrate: (metadata.format.bit_rate || 0).toString(),
        sampleRate: (audioStream?.sample_rate || 0).toString(),
        channels: (audioStream?.channels || 0).toString(),
        format: metadata.format.format_name || ext.substring(1),
        artist: metadata.format.tags?.artist || '',
        title: metadata.format.tags?.title || filename,
        album: metadata.format.tags?.album || dirname,
        year: metadata.format.tags?.date || '',
      },
      mimeType: getMimeTypeFromExt(ext),
    };
  } catch (error) {
    console.warn('Error parsing audio metadata:', error);
    // 如果解析失败，返回基础信息
    const content = `音频：${filename}
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
