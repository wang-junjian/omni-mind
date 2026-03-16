'use client';

import { useEffect, useState } from 'react';
import SearchBar from '@/components/SearchBar';
import FileCard from '@/components/FileCard';
import { SearchResult } from '@/lib/vector/sqlite';
import { Loader2 } from 'lucide-react';

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, limit: 50 }),
        });

        if (!response.ok) {
          throw new Error('搜索失败');
        }

        const data = await response.json();
        setResults(data.results);
      } catch (err) {
        setError('搜索时发生错误，请稍后重试');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <a href="/" className="text-xl font-bold text-blue-600 flex-shrink-0">
              Omni Mind
            </a>
            <SearchBar initialQuery={query} className="flex-1" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {query && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              搜索结果: "{query}"
            </h1>
            {!isLoading && (
              <p className="text-gray-600">
                找到 {results.length} 个相关结果
              </p>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">正在搜索中...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {!isLoading && !error && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result) => (
              <FileCard key={result.fileId} result={result} />
            ))}
          </div>
        )}

        {!isLoading && !error && results.length === 0 && query && (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">没有找到相关的文件</p>
            <p className="text-sm text-gray-400">
              请尝试使用其他关键词，或确保文件已完成索引
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
