import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ContactSellerButton from "@/components/ContactSellerButton";

export default async function BookDetailsPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: {
      seller: {
        select: { id: true, name: true, image: true, university: true }
      }
    }
  });

  if (!book) return notFound();

  // 計算折數 (如果有原價的話)
  const discount = book.originalPrice 
    ? Math.round((book.price / book.originalPrice) * 100) / 10 
    : null;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
          
          {/* 左邊：圖片區 */}
          <div className="bg-gray-100 p-8 flex items-center justify-center min-h-[400px] relative">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="w-64 h-auto shadow-2xl rounded-lg transform hover:scale-105 transition duration-500" />
            ) : (
              <div className="text-gray-400 font-bold text-xl">無封面圖片</div>
            )}
            
            {/* 顯示折數標籤 */}
            {discount && (
               <div className="absolute top-6 left-6 bg-red-500 text-white font-black px-3 py-1 rounded-full shadow-lg transform -rotate-12">
                 {discount} 折
               </div>
            )}
          </div>

          {/* 右邊：資訊區 */}
          <div className="p-8 md:p-12 flex flex-col">
            <div className="flex-1">
              {/* 課程與教授標籤 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {book.courseName && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                    📘 {book.courseName}
                  </span>
                )}
                {book.professor && (
                  <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">
                    👨‍🏫 {book.professor}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{book.title}</h1>
              
              {/* 👇👇👇 這裡修復了 author 的錯誤 👇👇👇 */}
              <p className="text-lg text-gray-500 mb-6 font-medium">
                作者：{book.author}
              </p>

              <div className="space-y-6 mb-8">
                {/* 價格區塊 */}
                <div className="flex items-end gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">目前售價</p>
                    <span className="text-4xl font-black text-blue-600">${book.price}</span>
                  </div>
                  {book.originalPrice && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-0">原價</p>
                      <span className="text-lg text-gray-400 line-through decoration-2">${book.originalPrice}</span>
                    </div>
                  )}
                </div>
                
                {/* 書況細節網格 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">書況</p>
                    <p className="font-bold text-gray-800">{book.condition}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">內頁劃記</p>
                    <p className="font-bold text-gray-800">{book.noteStatus || "未標示"}</p>
                  </div>
                </div>

                {/* 詳細備註 */}
                <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-100">
                   <p className="text-xs text-yellow-600 font-bold uppercase mb-2 flex items-center gap-1">
                     📝 賣家備註
                   </p>
                   <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                     {book.description || "賣家沒有留下詳細介紹，建議私訊詢問書況細節。"}
                   </p>
                </div>
              </div>
            </div>

            {/* 底部按鈕區 */}
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center gap-3 mb-4">
                <img src={book.seller.image || "https://ui-avatars.com/api/?name=User"} className="w-10 h-10 rounded-full border border-gray-200" />
                <div>
                  <p className="text-sm font-bold text-gray-900">賣家：{book.seller.name}</p>
                  <p className="text-xs text-gray-500">{book.seller.university || "未提供學校"}</p>
                </div>
              </div>

              <ContactSellerButton 
                sellerId={book.seller.id} 
                bookTitle={book.title}
              />
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}