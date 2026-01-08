import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SearchBar from "@/components/SearchBar"; // 記得確認你有引入 SearchBar

// 👇 重要：強制動態渲染，確保每次重新整理都能看到最新上架的書
export const dynamic = "force-dynamic";

export default async function Home(props: { searchParams: Promise<{ q?: string; uni?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const university = searchParams.uni || "";

  // 👇 查詢資料庫 (包含搜尋邏輯 + 狀態過濾)
  const books = await prisma.book.findMany({
    where: {
      AND: [
        {
          status: "ON_SALE", // 👈 只找上架中的
        },
        {
          // 搜尋邏輯 (如果有輸入關鍵字)
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { author: { contains: query, mode: "insensitive" } }, 
            { courseName: { contains: query, mode: "insensitive" } },
            { professor: { contains: query, mode: "insensitive" } },
          ],
        },
        // 大學篩選邏輯 (如果有選大學)
        university ? { seller: { university: { contains: university } } } : {},
      ],
    },
    orderBy: {
      createdAt: "desc", // 最新的書排前面
    },
    include: {
      seller: {
        select: {
          name: true,
          image: true,
          university: true, // 順便抓大學，顯示時可能用到
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero 區塊 (上方大圖) */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
              讓你的舊課本<br />
              <span className="text-blue-600">找到新主人</span>
            </h1>
            <p className="text-xl text-gray-500 mb-8 leading-relaxed">
              全台最大的大學二手書交易平台。<br />
              簡單上架，快速成交，不再讓書本長灰塵。
            </p>
            
            {/* 👇 這裡插入搜尋框，讓 Hero 區塊也能搜尋 */}
            <div className="max-w-md mb-8">
               <SearchBar />
            </div>

            <div className="flex gap-4">
              <Link
                href="/sell"
                className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition shadow-lg hover:-translate-y-1"
              >
                開始賣書
              </Link>
              <a
                href="#books"
                className="bg-gray-100 text-gray-800 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition"
              >
                瀏覽書籍
              </a>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center relative">
            <div className="w-80 h-80 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50 absolute -z-10"></div>
            <div className="text-[10rem] animate-bounce-slow">📚</div>
          </div>
        </div>
      </div>

      {/* 書籍列表區塊 */}
      <div id="books" className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex justify-between items-end mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-800">
              {query ? `🔍 "${query}" 的搜尋結果` : "🔥 最新上架"}
            </h2>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">
              {books.length} 本
            </span>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-6xl mb-4">😢</p>
            <h3 className="text-xl font-bold text-gray-800">
              {query ? "找不到相關書籍" : "目前沒有架上的書籍"}
            </h3>
            <p className="text-gray-500 mt-2">
              {query ? "試試看搜尋其他關鍵字？" : "快來成為第一個賣家吧！"}
            </p>
            {query && (
               <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
                 清除搜尋
               </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col h-full"
              >
                {/* 封面圖 */}
                <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold bg-slate-50">
                      NO COVER
                    </div>
                  )}
                  {/* 書況標籤 */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md border border-white/20">
                      {book.condition}
                    </span>
                  </div>
                </div>

                {/* 內容資訊 */}
                <div className="p-4 flex flex-col flex-1">
                  {/* 課程名稱標籤 */}
                  {book.courseName && (
                     <div className="mb-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                           {book.courseName}
                        </span>
                     </div>
                  )}

                  <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition text-lg">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 truncate">
                    {book.author}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-xl font-black text-gray-900">
                      ${book.price}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <img
                        src={book.seller.image || "https://ui-avatars.com/api/?name=User"}
                        className="w-6 h-6 rounded-full border border-gray-200"
                        alt="seller"
                      />
                      <span className="truncate max-w-[80px]">{book.seller.name}</span>
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