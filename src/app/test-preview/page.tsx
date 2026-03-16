'use client';

import { useState } from 'react';

export default function TestPreviewPage() {
  const [fileId, setFileId] = useState('438');
  const [imageSrc, setImageSrc] = useState('');

  const loadImage = () => {
    setImageSrc(`/api/preview/${fileId}?t=${Date.now()}`); // 加时间戳防止缓存
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">图片预览测试</h1>

        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={fileId}
              onChange={(e) => setFileId(e.target.value)}
              placeholder="输入文件ID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded"
            />
            <button
              onClick={loadImage}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              加载图片
            </button>
          </div>

          {imageSrc && (
            <div className="border-2 border-dashed border-gray-300 rounded p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-4">图片地址: {imageSrc}</p>
              <p className="text-sm text-gray-600 mb-4">直接访问地址: <a href={imageSrc} target="_blank" className="text-blue-600 underline" rel="noreferrer">在新标签页打开</a></p>

              <h3 className="font-medium mb-2">原生img标签测试:</h3>
              <img
                src={imageSrc}
                alt="测试图片"
                className="max-w-md border border-gray-200"
                onLoad={() => alert('图片加载成功!')}
                onError={(e) => {
                  console.error('图片加载错误', e);
                  alert('图片加载失败! 请查看控制台错误信息');
                }}
              />

              <h3 className="font-medium mt-8 mb-2">ImagePreview组件测试:</h3>
              <div className="h-96 border border-gray-200">
                <iframe
                  src={`/preview/${fileId}`}
                  width="100%"
                  height="100%"
                  title="预览页面"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h3 className="font-medium text-yellow-900 mb-2">测试步骤:</h3>
          <ol className="list-decimal list-inside text-yellow-800 space-y-1">
            <li>输入文件ID，点击"加载图片"按钮</li>
            <li>查看原生img标签是否能正常显示图片</li>
            <li>点击"在新标签页打开"链接，查看新标签页是否能正常显示</li>
            <li>查看下方iframe中的预览页面是否能正常显示</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
