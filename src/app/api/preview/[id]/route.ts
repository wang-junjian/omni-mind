import { NextResponse } from 'next/server';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { db } from '../../../../lib/db/client';
import { files } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { getMimeTypeFromExt } from '../../../../lib/parser';
import { logger } from '../../../../lib/utils/logger';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const requestId = Math.random().toString(36).substring(2, 10);
  const startTime = Date.now();

  try {
    await logger.info('PREVIEW', `[${requestId}] Received preview request`, {
      id: params.id,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      range: request.headers.get('range'),
    });

    const { searchParams } = new URL(request.url);
    const debugPath = searchParams.get('path');
    const isDownload = searchParams.get('download') === '1';

    let filePath: string;
    let filename: string;
    let mimeType: string;
    let fileRecord: any = null;

    if (debugPath) {
      // 调试模式：直接通过路径访问文件
      filePath = decodeURIComponent(debugPath);
      filename = path.basename(filePath);
      const ext = path.extname(filename).toLowerCase();
      mimeType = getMimeTypeFromExt(ext);

      await logger.debug('PREVIEW', `[${requestId}] Debug mode enabled`, { debugPath, filePath });
    } else {
      // 正常模式：通过ID访问
      const fileId = parseInt(params.id);
      await logger.debug('PREVIEW', `[${requestId}] Looking up file in DB`, { fileId });

      fileRecord = await db.select().from(files).where(eq(files.id, fileId)).get();

      if (!fileRecord) {
        await logger.error('PREVIEW', `[${requestId}] File not found in DB`, { fileId });
        return NextResponse.json({
          error: 'File not found in database',
          requestId,
          fileId
        }, { status: 404 });
      }

      filePath = fileRecord.filePath;
      filename = fileRecord.filename;
      mimeType = fileRecord.mimeType;

      await logger.info('PREVIEW', `[${requestId}] File found in DB`, {
        fileId,
        filename,
        filePath,
        fileType: fileRecord.fileType,
        mimeType,
        category: fileRecord.category,
      });

      // 更新最后访问时间
      try {
        await db.update(files)
          .set({ lastAccessedAt: new Date() })
          .where(eq(files.id, fileId));
        await logger.debug('PREVIEW', `[${requestId}] Updated last accessed time`, { fileId });
      } catch (updateError) {
        await logger.warn('PREVIEW', `[${requestId}] Failed to update last accessed time`, {
          error: (updateError as Error).message
        });
      }
    }

    // 标准化路径处理，解决中文和特殊字符问题
    filePath = path.normalize(filePath);
    await logger.debug('PREVIEW', `[${requestId}] Normalized file path`, { originalPath: fileRecord?.filePath || debugPath, normalizedPath: filePath });

    // 检查文件是否存在且可读
    let stats: fs.Stats;
    try {
      await fsPromises.access(filePath, fs.constants.R_OK);
      stats = await fsPromises.stat(filePath);

      if (!stats.isFile()) {
        throw new Error('Path is not a regular file');
      }

      await logger.debug('PREVIEW', `[${requestId}] File access check passed`, {
        size: stats.size,
        isFile: stats.isFile(),
        lastModified: stats.mtime.toISOString(),
      });
    } catch (accessErr) {
      const error = accessErr as Error;
      await logger.error('PREVIEW', `[${requestId}] File access failed`, {
        filePath,
        error: error.message,
        code: (error as any).code,
      });

      return NextResponse.json({
        error: 'File not found or no read permission',
        requestId,
        path: filePath,
        errorCode: (error as any).code,
        errorDetail: error.message,
      }, { status: 404 });
    }

    const range = request.headers.get('range');
    const fileSize = stats.size;

    // 处理 Range 请求（用于音频/视频流式播放）
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      await logger.info('PREVIEW', `[${requestId}] Serving range request`, {
        start,
        end,
        chunksize,
        fileSize,
      });

      const stream = fs.createReadStream(filePath, { start, end });

      const headers = new Headers();
      headers.set('Content-Type', mimeType);
      headers.set('Content-Length', chunksize.toString());
      headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

      if (isDownload) {
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      }

      return new NextResponse(stream as any, {
        status: 206,
        headers,
      });
    }

    // 完整文件请求
    await logger.debug('PREVIEW', `[${requestId}] Serving full file`, { fileSize });

    const stream = fs.createReadStream(filePath);

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Content-Length', fileSize.toString());
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (isDownload) {
      headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    }

    const duration = Date.now() - startTime;
    await logger.info('PREVIEW', `[${requestId}] Sending file response`, {
      filename,
      mimeType,
      size: fileSize,
      durationMs: duration,
    });

    return new NextResponse(stream as any, {
      status: 200,
      headers,
    });
  } catch (globalError) {
    const error = globalError as Error;
    const duration = Date.now() - startTime;

    await logger.error('PREVIEW', `[${requestId}] Unhandled preview error`, {
      error: error.message,
      stack: error.stack,
      durationMs: duration,
    });

    return NextResponse.json({
      error: `Internal server error: ${error.message}`,
      requestId,
      durationMs: duration,
    }, { status: 500 });
  }
}
