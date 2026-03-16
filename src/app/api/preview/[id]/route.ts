import { NextResponse } from 'next/server';
import fs from 'fs/promises';
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
    });

    const { searchParams } = new URL(request.url);
    const debugPath = searchParams.get('path');

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
    try {
      await fs.access(filePath, fs.constants.R_OK);
      const stats = await fs.stat(filePath);

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

    // 读取文件内容
    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(filePath);
      await logger.debug('PREVIEW', `[${requestId}] File read successfully`, {
        size: fileBuffer.length,
        bytesRead: fileBuffer.length,
      });
    } catch (readErr) {
      const error = readErr as Error;
      await logger.error('PREVIEW', `[${requestId}] Failed to read file`, {
        filePath,
        error: error.message,
        code: (error as any).code,
      });

      return NextResponse.json({
        error: 'Failed to read file',
        requestId,
        path: filePath,
        errorCode: (error as any).code,
        errorDetail: error.message,
      }, { status: 500 });
    }

    const duration = Date.now() - startTime;
    await logger.info('PREVIEW', `[${requestId}] Sending file response`, {
      filename,
      mimeType,
      size: fileBuffer.length,
      durationMs: duration,
    });

    // 返回文件 - 简化响应头，确保兼容性
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
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
