import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './data/omni-mind.db';

// 确保数据目录存在
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);

// 加载向量扩展
try {
  // 尝试不同的路径加载向量扩展
  try {
    sqlite.loadExtension(require.resolve('sqlite-vss/dist/vector0'));
    sqlite.loadExtension(require.resolve('sqlite-vss/dist/vss0'));
  } catch (e) {
    try {
      sqlite.loadExtension('vector0');
      sqlite.loadExtension('vss0');
    } catch (e2) {
      // 尝试从系统路径加载
      sqlite.loadExtension('/usr/lib/sqlite3/vector0');
      sqlite.loadExtension('/usr/lib/sqlite3/vss0');
    }
  }
  console.log('SQLite vector extensions loaded successfully');
} catch (error) {
  console.warn('Failed to load SQLite vector extensions:', (error as Error).message);
  console.warn('Using keyword search fallback instead of semantic search');
}

export const db = drizzle(sqlite, { schema });
