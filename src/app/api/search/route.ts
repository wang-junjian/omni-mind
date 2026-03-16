import { NextResponse } from 'next/server';
import { semanticSearch } from '../../../lib/vector/sqlite';
import { db } from '../../../lib/db/client';
import { searchHistory } from '../../../lib/db/schema';

export async function POST(request: Request) {
  try {
    const { query, limit = 20 } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 执行搜索
    const results = await semanticSearch(query, limit);

    // 记录搜索历史
    await db.insert(searchHistory).values({
      query,
      resultsCount: results.length,
    });

    return NextResponse.json({
      success: true,
      query,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
