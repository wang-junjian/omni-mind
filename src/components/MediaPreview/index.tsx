'use client';

import TextPreview from './TextPreview';
import ImagePreview from './ImagePreview';
import AudioPreview from './AudioPreview';
import VideoPreview from './VideoPreview';
import SpreadsheetPreview from './SpreadsheetPreview';
import { File } from '../../lib/db/schema';
import { useEffect, useState } from 'react';

interface MediaPreviewProps {
  file: File;
}

export default function MediaPreview({ file }: MediaPreviewProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = `/api/preview/${file.id}`;

  useEffect(() => {
    if (file.fileType === 'text') {
      // 文本类型需要加载内容用于语法高亮
      fetch(previewUrl)
        .then(res => res.text())
        .then(text => {
          setContent(text);
          setLoading(false);
        })
        .catch(err => {
          setError('加载文件内容失败');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [file, previewUrl]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  switch (file.fileType) {
    case 'text':
      return <TextPreview content={content} fileType={file.fileType} />;
    case 'image':
      return <ImagePreview src={previewUrl} alt={file.filename} />;
    case 'audio':
      return <AudioPreview src={previewUrl} title={file.filename} />;
    case 'video':
      return <VideoPreview src={previewUrl} title={file.filename} />;
    case 'spreadsheet':
      return <SpreadsheetPreview src={previewUrl} />;
    default:
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
          <div className="text-gray-500 mb-4">不支持的文件格式预览</div>
          <a
            href={previewUrl}
            download={file.filename}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            下载文件
          </a>
        </div>
      );
  }
}
