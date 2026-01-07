import { prisma } from "@/lib/prisma";
import Link from "next/link";

// 這裡可以定義你的書籍卡片元件，或者直接寫在下面
// 為了方便，我們直接寫在頁面裡，或者你可以 import 之前的 BookCard

export default async function Home() {
  // 👇 關鍵修改：只抓取狀態為 "ON_SALE" 的書
  const books = await prisma.book.findMany({
    where: {
      status: "ON_SALE", // 👈 這行讓已售出的書自動消失！
    },
    orderBy: {
      createdAt: "desc", // 最新的書排前面
    },
    include: {
      seller: {
        select: {
          name: true,
          image: true,
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
          <div className="md:w-1/2 flex justify-center">
            {/* 這裡可以放一張插圖 */}
            <div className="w-80 h-80 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50 absolute -z-10"></div>
            <div className="text-[10rem]">📚</div>
          </div>
        </div>
      </div>

      {/* 書籍列表區塊 */}
      <div id="books" className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-gray-800">🔥 最新上架</h2>
          {/* 這裡未來可以放 "查看更多" */}
        </div>

        {books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-6xl mb-4">😢</p>
            <h3 className="text-xl font-bold text-gray-800">目前沒有架上的書籍</h3>
            <p className="text-gray-500 mt-2">快來成為第一個賣家吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col"
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-slate-50">
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
                      <img
                        src={book.seller.image || "/default-avatar.png"}
                        className="w-5 h-5 rounded-full border border-gray-200"
                        alt="seller"
                      />
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