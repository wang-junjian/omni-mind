import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// 测试接口，直接返回一个已知的图片文件
export async function GET() {
  try {
    // 替换为您资源库中一个实际存在的图片路径
    const testFilePath = '/Users/junjian/Downloads/资源库/宫崎骏原画手稿/随便选一个存在的文件名.jpg';

    // 先测试文件是否存在
    try {
      await fs.access(testFilePath);
      console.log('文件存在');
    } catch (e) {
      console.error('文件不存在:', e);
      return NextResponse.json({ error: '测试文件不存在', path: testFilePath }, { status: 404 });
    }

    const buffer = await fs.readFile(testFilePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  } catch (error) {
    console.error('测试预览失败:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
