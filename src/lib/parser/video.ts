import fs from 'fs/promises';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { FileParseResult, getMimeTypeFromExt } from './index';

const ffprobe = promisify(ffmpeg.ffprobe);

export async function parseVideoFile(filePath: string): Promise<FileParseResult> {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath, ext);
  const dirname = path.basename(path.dirname(filePath));
  const stats = await fs.stat(filePath);

  try {
    const metadata = await ffprobe(filePath);
    const videoStream = metadata.streams.find(s => s.codec_type === 'video');
    const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

    const duration = metadata.format.duration ?
      `${Math.floor(metadata.format.duration / 3600)}:${Math.floor((metadata.format.duration % 3600) / 60).toString().padStart(2, '0')}:${Math.floor(metadata.format.duration % 60).toString().padStart(2, '0')}` :
      '未知';

    const content = `视频：${filename}
分类：${dirname}
时长：${duration}
分辨率：${videoStream?.width || '未知'}x${videoStream?.height || '未知'}
视频编码：${videoStream?.codec_name || '未知'}
帧率：${videoStream?.r_frame_rate ? videoStream.r_frame_rate.split('/')[0] : '未知'} fps
比特率：${metadata.format.bit_rate ? `${Math.round(metadata.format.bit_rate / 1000)} kbps` : '未知'}
音频编码：${audioStream?.codec_name || '未知'}
音频声道：${audioStream?.channels || '未知'}
格式：${metadata.format.format_name || ext.substring(1)}
大小：${(stats.size / 1024 / 1024).toFixed(2)}MB
标题：${metadata.format.tags?.title || filename}
`;

    return {
      content,
      metadata: {
        size: stats.size.toString(),
        lastModified: stats.mtime.toISOString(),
        duration: (metadata.format.duration || 0).toString(),
        width: (videoStream?.width || 0).toString(),
        height: (videoStream?.height || 0).toString(),
        videoCodec: videoStream?.codec_name || '',
        audioCodec: audioStream?.codec_name || '',
        bitrate: (metadata.format.bit_rate || 0).toString(),
        format: metadata.format.format_name || ext.substring(1),
        title: metadata.format.tags?.title || filename,
      },
      mimeType: getMimeTypeFromExt(ext),
    };
  } catch (error) {
    console.warn('Error parsing video metadata:', error);
    // 如果解析失败，返回基础信息
    const content = `视频：${filename}
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
