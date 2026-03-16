import { db } from '../db/client';
import { files, fileEmbeddings } from '../db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { generateEmbedding } from '../embedding/openai';

export interface SearchResult {
  fileId: number;
  filename: string;
  filePath: string;
  fileType: string;
  category: string;
  similarity: number;
  contentChunk: string;
}

export async function semanticSearch(query: string, limit: number = 20): Promise<SearchResult[]> {
  try {
    // 先尝试使用关键词搜索，更稳定
    return keywordSearch(query, limit);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function keywordSearch(query: string, limit: number = 20): Promise<SearchResult[]> {
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k);

  if (keywords.length === 0) {
    return [];
  }

  try {
    // 构建查询条件
    const conditions = keywords.map(keyword => sql`
      (LOWER(${files.filename}) LIKE ${`%${keyword}%`} OR
       LOWER(${files.category}) LIKE ${`%${keyword}%`} OR
       LOWER(${fileEmbeddings.contentChunk}) LIKE ${`%${keyword}%`})
    `);

    const whereClause = conditions.reduce((a, b) => sql`${a} OR ${b}`);

    const results = await db.selectDistinct({
      fileId: files.id,
      filename: files.filename,
      filePath: files.filePath,
      fileType: files.fileType,
      category: files.category,
      contentChunk: fileEmbeddings.contentChunk,
    })
      .from(fileEmbeddings)
      .join(files, eq(fileEmbeddings.fileId, files.id))
      .where(whereClause)
      .limit(limit);

    // 去重
    const uniqueResults = new Map<number, SearchResult>();
    for (const result of results) {
      if (!uniqueResults.has(result.fileId)) {
        uniqueResults.set(result.fileId, {
          ...result,
          similarity: 0.8,
          contentChunk: result.contentChunk.substring(0, 200) + '...',
        });
      }
    }

    return Array.from(uniqueResults.values());
  } catch (error) {
    console.error('Keyword search error:', error);
    // 如果查询出错，回退到只查文件名和分类
    const results = await db.selectDistinct({
      fileId: files.id,
      filename: files.filename,
      filePath: files.filePath,
      fileType: files.fileType,
      category: files.category,
    })
      .from(files)
      .where(sql`
        ${keywords.map(keyword => sql`
          (LOWER(${files.filename}) LIKE ${`%${keyword}%`} OR
           LOWER(${files.category}) LIKE ${`%${keyword}%`})
        `).reduce((a, b) => sql`${a} OR ${b}`)}
      `)
      .limit(limit);

    return results.map(result => ({
      ...result,
      similarity: 0.7,
      contentChunk: '',
    }));
  }
}
