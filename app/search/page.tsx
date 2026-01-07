import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SearchBar from "@/components/SearchBar"; // 引入剛剛做的搜尋框 (給手機版用)

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q || "";

  // 如果沒有搜尋字，給空陣列；有搜尋字才去資料庫找
  const books = query
    ? await prisma.book.findMany({
        where: {
          status: "ON_SALE", // 只找架上的
          OR: [
            { title: { contains: query} },       // 找書名
            { description: { contains: query } }, // 找描述
            { authors: { has: query } },          // 找作者 (陣列比對)
            { courseName: { contains: query } },  // 找課程
            { professor: { contains: query } },   // 找教授
            { isbn: { contains: query } },        // 找 ISBN
          ],
        },
        include: {
          seller: { select: { name: true, image: true } },
        },
      })
    : [];

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* 標題區 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔍 搜尋結果：<span className="text-blue-600">{query || "全部"}</span>
          </h1>
          <p className="text-gray-500">找到 {books.length} 筆相關書籍</p>
        </div>

        {/* 手機版搜尋框 (電腦版在導覽列，手機版這裡也放一個方便搜) */}
        <div className="md:hidden mb-8">
            <SearchBar />
        </div>

        {/* 搜尋結果列表 */}
        {books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-6xl mb-4">🤔</p>
            <h3 className="text-xl font-bold text-gray-800">找不到相關書籍</h3>
            <p className="text-gray-500 mt-2">試試看別的關鍵字，例如「經濟」、「微積分」</p>
            <Link href="/" className="inline-block mt-6 text-blue-600 font-bold hover:underline">
              回首頁瀏覽全部
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col"
              >
                <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-slate-50">NO COVER</div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md border border-white/20">
                      {book.condition}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 truncate">
                    {book.authors.join(", ")}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-black text-blue-600">
                      NT$ {book.price}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <img src={book.seller.image || "/default-avatar.png"} className="w-5 h-5 rounded-full border border-gray-200" />
                      <span className="truncate max-w-[60px]">{book.seller.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}