import Link from 'next/link';
import { prisma } from '@/lib/prisma'; // 引入資料庫連線
import BookCard from '@/components/BookCard'; // 引入剛剛做的卡片

// 這是伺服器元件 (Server Component)，可以直接讀資料庫
export default async function Home() {
  // 1. 從資料庫抓取所有書籍，按照建立時間倒序排列 (最新的在上面)
  const books = await prisma.book.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      
      {/* 頂部 Hero 區塊 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            CampusBooks TW
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl">
            全台大學生專屬的二手書交易平台。<br/>
            輸入 ISBN 一鍵上架，或是透過課程名稱找到你的教科書。
          </p>
          
          <div className="flex gap-4">
            <Link 
              href="/sell" 
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              我要賣書 📦
            </Link>
            
            {/* ✨ 修改這裡：將 button 改成 Link，並指向 /search */}
            <Link 
              href="/search"
              className="px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-full font-bold hover:bg-gray-50 transition flex items-center gap-2"
            >
              搜尋書籍 🔍
            </Link>
          </div>
        </div>
      </div>

      {/* 書籍列表區塊 */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">最新上架 📖</h2>
          <span className="text-gray-500 text-sm">共 {books.length} 本書籍</span>
        </div>

        {/* 如果資料庫沒書，顯示提示 */}
        {books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-xl text-gray-500 mb-4">目前還沒有書籍上架</p>
            <Link href="/sell" className="text-blue-600 underline">
              成為第一個賣家！
            </Link>
          </div>
        ) : (
          /* 如果有書，顯示網格列表 */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}