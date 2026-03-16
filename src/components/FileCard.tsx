import Link from 'next/link';
import { FileText, Image, Music, Video, FileSpreadsheet, File as FileIcon } from 'lucide-react';
import { SearchResult } from '../lib/vector/sqlite';

interface FileCardProps {
  result: SearchResult;
}

export default function FileCard({ result }: FileCardProps) {
  const getFileIcon = () => {
    switch (result.fileType) {
      case 'text':
        return <FileText className="text-blue-500" size={32} />;
      case 'image':
        return <Image className="text-green-500" size={32} />;
      case 'audio':
        return <Music className="text-purple-500" size={32} />;
      case 'video':
        return <Video className="text-red-500" size={32} />;
      case 'spreadsheet':
        return <FileSpreadsheet className="text-emerald-500" size={32} />;
      default:
        return <FileIcon className="text-gray-500" size={32} />;
    }
  };

  const getFileTypeLabel = () => {
    switch (result.fileType) {
      case 'text':
        return '文本';
      case 'image':
        return '图片';
      case 'audio':
        return '音频';
      case 'video':
        return '视频';
      case 'spreadsheet':
        return '表格';
      default:
        return '文件';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Link href={`/preview/${result.fileId}`} className="block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate mb-1" title={result.filePath}>
              {result.filename}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs">
                {getFileTypeLabel()}
              </span>
              <span className="truncate" title={result.filePath}>
                {result.filePath.replace('/Users/junjian/Downloads/资源库/', '')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <span>分类: {result.category}</span>
              <span>•</span>
              <span>相似度: {(result.similarity * 100).toFixed(1)}%</span>
            </div>
            {result.contentChunk && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {result.contentChunk.substring(0, 150)}...
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
