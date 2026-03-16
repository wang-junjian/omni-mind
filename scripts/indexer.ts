import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import chokidar from 'chokidar';
import { db } from '../src/lib/db/client';
import { files, fileMetadata, fileContent, fileEmbeddings } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { parseFile, getFileTypeFromExt, getMimeTypeFromExt } from '../src/lib/parser';
import { splitTextIntoChunks } from '../src/lib/embedding/openai';

const RESOURCE_PATH = process.env.RESOURCE_PATH || '/Users/junjian/Downloads/资源库';
const BATCH_SIZE = 10;

async function scanDirectory(dir: string, baseDir: string = dir): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await scanDirectory(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function indexFile(filePath: string): Promise<void> {
  console.log(`Indexing: ${filePath}`);

  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath);
    const filename = path.basename(filePath);
    const relativePath = path.relative(RESOURCE_PATH, filePath);
    const category = path.dirname(relativePath).split(path.sep)[0] || '其他';

    // 检查文件是否已存在
    const existingFile = await db.select().from(files).where(eq(files.filePath, filePath)).get();

    if (existingFile) {
      // 检查文件是否已修改
      if (new Date(existingFile.updatedAt).getTime() >= stats.mtime.getTime()) {
        console.log(`Skipping unchanged file: ${filePath}`);
        return;
      }
      // 删除旧数据
      await db.delete(fileEmbeddings).where(eq(fileEmbeddings.fileId, existingFile.id));
      await db.delete(fileContent).where(eq(fileContent.fileId, existingFile.id));
      await db.delete(fileMetadata).where(eq(fileMetadata.fileId, existingFile.id));
      await db.delete(files).where(eq(files.id, existingFile.id));
    }

    // 插入文件记录
    const [newFile] = await db.insert(files).values({
      filename,
      filePath,
      fileSize: stats.size,
      fileType: getFileTypeFromExt(ext),
      mimeType: getMimeTypeFromExt(ext),
      category,
      updatedAt: stats.mtime,
    }).returning();

    try {
      // 解析文件内容和元数据
      const parseResult = await parseFile(filePath);

      // 插入元数据
      for (const [key, value] of Object.entries(parseResult.metadata)) {
        await db.insert(fileMetadata).values({
          fileId: newFile.id,
          key,
          value,
        });
      }

      // 插入内容
      await db.insert(fileContent).values({
        fileId: newFile.id,
        content: parseResult.content,
        contentType: 'raw',
      });

      // 插入关键词索引片段
      const chunks = splitTextIntoChunks(parseResult.content);
      console.log(`Split into ${chunks.length} chunks for ${filename}`);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        await db.insert(fileEmbeddings).values({
          fileId: newFile.id,
          contentChunk: chunk,
          embedding: Buffer.from([]), // 空向量，暂时不用
          embeddingModel: 'keyword',
          chunkIndex: i,
        });
      }

      console.log(`Successfully indexed: ${filePath}`);
    } catch (parseError) {
      console.error(`Error parsing file ${filePath}:`, parseError);
      // 即使解析失败，也保留文件基本信息，方便后续重新索引
    }

  } catch (error) {
    console.error(`Error indexing file ${filePath}:`, error);
  }
}

async function fullIndex(): Promise<void> {
  console.log(`Starting full index of: ${RESOURCE_PATH}`);

  const allFiles = await scanDirectory(RESOURCE_PATH);
  console.log(`Found ${allFiles.length} files`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
    const batch = allFiles.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allFiles.length / BATCH_SIZE)}`);

    await Promise.all(batch.map(async (filePath) => {
      try {
        await indexFile(filePath);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Failed to index ${filePath}:`, error);
      }
    }));
  }

  console.log(`Index completed. Success: ${successCount}, Errors: ${errorCount}`);
}

async function watchIndex(): Promise<void> {
  console.log(`Watching for changes in: ${RESOURCE_PATH}`);

  const watcher = chokidar.watch(RESOURCE_PATH, {
    ignoreInitial: true,
    persistent: true,
  });

  watcher
    .on('add', (filePath) => {
      console.log(`File added: ${filePath}`);
      indexFile(filePath);
    })
    .on('change', (filePath) => {
      console.log(`File changed: ${filePath}`);
      indexFile(filePath);
    })
    .on('unlink', async (filePath) => {
      console.log(`File deleted: ${filePath}`);
      try {
        const existingFile = await db.select().from(files).where(eq(files.filePath, filePath)).get();
        if (existingFile) {
          await db.delete(fileEmbeddings).where(eq(fileEmbeddings.fileId, existingFile.id));
          await db.delete(fileContent).where(eq(fileContent.fileId, existingFile.id));
          await db.delete(fileMetadata).where(eq(fileMetadata.fileId, existingFile.id));
          await db.delete(files).where(eq(files.id, existingFile.id));
          console.log(`Removed index for deleted file: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error removing index for deleted file ${filePath}:`, error);
      }
    });

  console.log('Watching for file changes...');
}

async function main() {
  const mode = process.argv[2] || 'full';

  if (mode === 'full') {
    await fullIndex();
  } else if (mode === 'watch') {
    await watchIndex();
  } else {
    console.error('Invalid mode. Use "full" or "watch"');
    process.exit(1);
  }
}

main().catch(console.error);
