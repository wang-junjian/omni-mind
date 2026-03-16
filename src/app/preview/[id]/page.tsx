import MediaPreview from '@/components/MediaPreview';
import { db } from '@/lib/db/client';
import { files } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default async function PreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const fileId = parseInt(params.id);
  const file = await db.select().from(files).where(eq(files.id, fileId)).get();

  if (!file) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">文件不存在</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="javascript:history.back()"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="font-medium text-gray-900 truncate max-w-4xl" title={file.filePath}>
                  {file.filename}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                  <span className="truncate max-w-xl" title={file.filePath}>
                    📂 {file.filePath.replace('/Users/junjian/Downloads/资源库/', '')}
                  </span>
                  <span>•</span>
                  <span>{file.category}</span>
                  <span>•</span>
                  <span>{formatFileSize(file.fileSize)}</span>
                  <span>•</span>
                  <span>{new Date(file.createdAt).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            </div>
            <a
              href={`/api/preview/${file.id}?download=1`}
              download={file.filename}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Download size={18} />
              下载
            </a>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MediaPreview file={file} />
      </div>
    </div>
  );
}
