import SearchBar from '@/components/SearchBar';
import { db } from '@/lib/db/client';
import { files } from '@/lib/db/schema';
import { count } from 'drizzle-orm';

export default async function Home() {
  // 获取统计信息 - 添加错误处理防止数据库表不存在时崩溃
  let totalFiles = { count: 0 };
  let stats: Array<{ fileType: string | null; count: number }> = [];

  try {
    totalFiles = await db.select({ count: count() }).from(files).get() || { count: 0 };
    stats = await db.select({
      fileType: files.fileType,
      count: count(),
    }).from(files).groupBy(files.fileType);
  } catch (error) {
    console.warn('Database not initialized yet:', error);
  }

  const statsMap = new Map(stats.map(s => [s.fileType, s.count]));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Omni Mind
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI 驱动的多媒体资料检索系统
          </p>

          <SearchBar className="mb-12" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {totalFiles?.count || 0}
              </div>
              <div className="text-sm text-gray-500">总文件数</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {statsMap.get('text') || 0}
              </div>
              <div className="text-sm text-gray-500">文本</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {statsMap.get('image') || 0}
              </div>
              <div className="text-sm text-gray-500">图片</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {statsMap.get('audio') || 0}
              </div>
              <div className="text-sm text-gray-500">音频</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {statsMap.get('video') || 0}
              </div>
              <div className="text-sm text-gray-500">视频</div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">使用说明</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>在搜索框中输入您想要查找的内容，支持自然语言查询</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>系统会智能匹配相关的文件，包括文本、图片、音频、视频等</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>点击文件卡片可以在线预览和播放各种格式的文件</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>首次使用请访问 <a href="/admin" className="text-blue-600 underline font-medium">管理页面</a> 进行文件索引，或运行 <code className="bg-gray-100 px-2 py-0.5 rounded">npm run indexer:full</code> 命令</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
