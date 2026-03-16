import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export const files = sqliteTable('files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  filePath: text('file_path').notNull().unique(),
  fileSize: integer('file_size').notNull(),
  fileType: text('file_type').notNull(),
  mimeType: text('mime_type').notNull(),
  category: text('category'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow().notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow().notNull(),
  lastAccessedAt: integer('last_accessed_at', { mode: 'timestamp' }),
});

export const fileMetadata = sqliteTable('file_metadata', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fileId: integer('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: text('value').notNull(),
}, (table) => ({
  unique: [table.fileId, table.key],
}));

export const fileContent = sqliteTable('file_content', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fileId: integer('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  contentType: text('content_type').notNull(), // raw, ocr, transcript, summary
  language: text('language').default('zh'),
});

export const fileEmbeddings = sqliteTable('file_embeddings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fileId: integer('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }),
  contentChunk: text('content_chunk').notNull(),
  embedding: blob('embedding').notNull(),
  embeddingModel: text('embedding_model').notNull(),
  chunkIndex: integer('chunk_index').notNull(),
});

export const searchHistory = sqliteTable('search_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  query: text('query').notNull(),
  resultsCount: integer('results_count'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type FileMetadata = typeof fileMetadata.$inferSelect;
export type NewFileMetadata = typeof fileMetadata.$inferInsert;
export type FileContent = typeof fileContent.$inferSelect;
export type NewFileContent = typeof fileContent.$inferInsert;
export type FileEmbedding = typeof fileEmbeddings.$inferSelect;
export type NewFileEmbedding = typeof fileEmbeddings.$inferInsert;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type NewSearchHistory = typeof searchHistory.$inferInsert;
