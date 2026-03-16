import { NextResponse } from 'next/server';
import { indexFile } from '../../../scripts/indexer';

export async function POST(request: Request) {
  try {
    const { filePath, mode } = await request.json();

    if (mode === 'single' && filePath) {
      await indexFile(filePath);
      return NextResponse.json({ success: true, message: `Successfully indexed ${filePath}` });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Index error:', error);
    return NextResponse.json({ error: 'Index failed' }, { status: 500 });
  }
}
