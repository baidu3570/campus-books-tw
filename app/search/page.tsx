import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BookCard from '@/components/BookCard';

// 1. 定義參數類型 (Next.js 15 規定這裡必須是 Promise)
interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // 2. ✨ 關鍵修改：先 await 等待參數解析完成
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';

  // 3. 去資料庫撈資料
  const books = query
    ? await prisma.book.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { courseName: { contains: query, mode: 'insensitive' } },
            { professor: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部搜尋列 */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 max-w-3xl mx-auto">
            <Link href="/" className="text-2xl font-bold text-blue-600 hidden md:block">
              CampusBooks
            </Link>
            
            <form action="/search" className="flex-1 flex gap-2">
              <input
                name="q"
                defaultValue={query}
                type="text"
                placeholder="輸入書名、課程名稱或教授姓名..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                搜尋
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 搜尋結果區 */}
      <div className="container mx-auto px-4 py-8">
        {!query ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl mb-2">👋 嗨！你想找什麼書？</p>
            <p className="text-sm">試試看搜尋「經濟學」或是教授的名字</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-800 mb-2">找不到關於「<span className="text-red-500 font-bold">{query}</span>」的書籍</p>
            <p className="text-gray-500 mb-6">這本書可能還沒人上架，或是關鍵字打錯囉？</p>
            <Link href="/sell" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              我有這本書，我要賣！
            </Link>
          </div>
        ) : (
          <div>
             <p className="mb-6 text-gray-600">
               找到 {books.length} 筆關於「<span className="font-bold text-black">{query}</span>」的結果：
             </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {books.map((book) => (
                 <BookCard key={book.id} book={book} />
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}