'use client';

import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, AlertCircle } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt: string;
}

export default function ImagePreview({ src, alt }: ImagePreviewProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log('ImagePreview: Loading image from', src);

    // 测试图片是否可以正常加载
    const testImg = new Image();
    testImg.onload = () => {
      console.log('ImagePreview: Image loaded successfully');
      setIsLoading(false);
      setHasError(false);
    };
    testImg.onerror = (err) => {
      console.error('ImagePreview: Failed to load image', err);
      setIsLoading(false);
      setHasError(true);
      setErrorMessage('图片加载失败');
    };
    testImg.src = src;
  }, [src]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
        <div className="text-white mb-4">图片加载中...</div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <div className="mb-4">{errorMessage}</div>
        <div className="text-gray-400 text-sm mb-4">路径: {src}</div>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          在新标签页打开
        </a>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <div className="flex justify-end gap-2 p-2 bg-gray-100 border-b flex-shrink-0">
        <button
          onClick={() => setScale(Math.max(0.25, scale - 0.25))}
          className="p-2 hover:bg-gray-200 rounded"
          title="缩小"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={() => setScale(Math.min(3, scale + 0.25))}
          className="p-2 hover:bg-gray-200 rounded"
          title="放大"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => setRotation((rotation + 90) % 360)}
          className="p-2 hover:bg-gray-200 rounded"
          title="旋转"
        >
          <RotateCw size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-900 p-4 min-h-0">
        <img
          src={src}
          alt={alt}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          className="object-contain"
        />
      </div>
    </div>
  );
}
