import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// 保存索引进程状态
let isIndexing = false;
let currentIndexProcess: any = null;
let indexLogs: string[] = [];

export async function POST(request: Request) {
  try {
    const { path: customPath, mode = 'full' } = await request.json();

    if (isIndexing) {
      return NextResponse.json({
        error: '索引正在进行中，请等待完成后再操作',
        isIndexing: true,
      }, { status: 400 });
    }

    isIndexing = true;
    indexLogs = [];

    // 构建索引命令
    let command = 'npm run indexer:full';
    let env = { ...process.env };

    if (customPath) {
      const absolutePath = path.resolve(customPath);
      try {
        await fs.access(absolutePath);
        env.RESOURCE_PATH = absolutePath;
        indexLogs.push(`自定义索引路径: ${absolutePath}`);
      } catch (error) {
        isIndexing = false;
        return NextResponse.json({
          error: '指定的路径不存在或无法访问',
          path: customPath,
        }, { status: 400 });
      }
    }

    // 执行索引命令
    currentIndexProcess = exec(command, {
      env,
      cwd: process.cwd(),
    });

    // 收集输出日志
    currentIndexProcess.stdout.on('data', (data: string) => {
      const lines = data.toString().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          indexLogs.push(line.trim());
        }
      });
    });

    currentIndexProcess.stderr.on('data', (data: string) => {
      const lines = data.toString().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          indexLogs.push(`[ERROR] ${line.trim()}`);
        }
      });
    });

    currentIndexProcess.on('close', (code: number) => {
      isIndexing = false;
      indexLogs.push(`索引完成，退出码: ${code}`);
      currentIndexProcess = null;
    });

    return NextResponse.json({
      success: true,
      message: '索引任务已启动',
      isIndexing: true,
    });
  } catch (error) {
    isIndexing = false;
    console.error('Indexer start error:', error);
    return NextResponse.json({
      error: '启动索引失败',
      detail: (error as Error).message,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    isIndexing,
    logs: indexLogs.slice(-100), // 只返回最近100条日志
  });
}
