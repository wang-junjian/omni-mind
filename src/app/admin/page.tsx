'use client';

import { useState, useEffect } from 'react';
import { Play, RefreshCw, CheckCircle, AlertCircle, FolderOpen } from 'lucide-react';

export default function AdminPage() {
  const [customPath, setCustomPath] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 检查索引状态
  const checkIndexStatus = async () => {
    try {
      const response = await fetch('/api/indexer/run');
      const data = await response.json();
      setIsIndexing(data.isIndexing);
      setLogs(data.logs);
    } catch (error) {
      console.error('Failed to check index status:', error);
    }
  };

  // 启动索引
  const startIndex = async () => {
    if (isIndexing) return;

    try {
      const response = await fetch('/api/indexer/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: customPath.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || '启动索引失败');
        return;
      }

      const data = await response.json();
      setIsIndexing(true);
      setLogs([]);
      alert('索引任务已启动，后台运行中');
    } catch (error) {
      console.error('Failed to start index:', error);
      alert('启动索引失败');
    }
  };

  // 选择目录
  const selectDirectory = async () => {
    try {
      // 这里使用input的directory选择
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.multiple = true;

      input.onchange = (e: any) => {
        if (e.target.files.length > 0) {
          const filePath = e.target.files[0].webkitRelativePath.split('/')[0];
          setCustomPath(filePath);
        }
      };

      input.click();
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  };

  useEffect(() => {
    checkIndexStatus();

    if (autoRefresh) {
      const interval = setInterval(checkIndexStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">系统管理</h1>
            <p className="text-gray-600">文件索引管理和系统配置</p>
          </div>

          <div className="p-6 space-y-6">
            {/* 索引控制区域 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">文件索引</h2>

              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    索引路径 (留空使用默认路径)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customPath}
                      onChange={(e) => setCustomPath(e.target.value)}
                      placeholder="请输入要索引的目录路径"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isIndexing}
                    />
                    <button
                      onClick={selectDirectory}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                      disabled={isIndexing}
                      title="选择目录"
                    >
                      <FolderOpen size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={startIndex}
                    disabled={isIndexing}
                    className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isIndexing ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <Play size={20} />
                    )}
                    {isIndexing ? '索引中...' : '开始索引'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${isIndexing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-sm text-gray-600">
                  {isIndexing ? '索引进行中' : '系统空闲'}
                </span>

                <div className="flex items-center gap-2 ml-4">
                  <input
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="autoRefresh" className="text-sm text-gray-600">
                    自动刷新日志
                  </label>
                </div>
              </div>

              {/* 日志区域 */}
              <div className="border border-gray-200 rounded-lg bg-black">
                <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                  <span className="text-white text-sm font-medium">索引日志</span>
                  <button
                    onClick={() => setLogs([])}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    清空
                  </button>
                </div>
                <div className="p-3 h-96 overflow-auto font-mono text-sm">
                  {logs.length === 0 ? (
                    <div className="text-gray-500 italic">暂无日志</div>
                  ) : (
                    logs.map((log, index) => (
                      <div
                        key={index}
                        className={`mb-1 ${
                          log.includes('[ERROR]')
                            ? 'text-red-400'
                            : log.includes('Successfully indexed')
                            ? 'text-green-400'
                            : log.includes('Skipping')
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                <CheckCircle size={16} />
                功能说明
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 全量索引会重新扫描所有文件，更新文件信息和搜索索引</li>
                <li>• 索引过程中系统仍然可以正常访问和搜索</li>
                <li>• 大数量文件索引可能需要较长时间，请耐心等待</li>
                <li>• 访问 <a href="/logs" className="underline font-medium">系统日志</a> 可以查看更详细的错误信息</li>
              </ul>
            </div>

            {isIndexing && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  注意事项
                </h3>
                <p className="text-sm text-yellow-800">
                  索引正在运行中，请不要关闭页面或重启服务器，索引完成后会自动刷新状态。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
