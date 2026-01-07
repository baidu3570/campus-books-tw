import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactSellerButton from "@/components/ContactSellerButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BookDetailsPage({ params }: Props) {
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      seller: {
        select: { name: true, image: true, email: true },
      },
    },
  });

  if (!book) {
    notFound();
  }

  // 判斷是否已售出
  const isSold = book.status === "SOLD";

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      
      {/* 🎨 背景裝飾 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Link href="/" className="hover:text-indigo-600 transition flex items-center gap-1">
            <span>🏠</span> 首頁
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800">書籍詳情</span>
        </div>

        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/50">
          <div className="md:flex">
            
            {/* 左側：圖片區 */}
            <div className="md:w-2/5 p-8 bg-gradient-to-b from-gray-50/50 to-gray-100/50 flex items-center justify-center relative">
              <div className="relative group perspective-1000 w-full max-w-[280px]">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                
                {/* 圖片容器 */}
                <div className="relative shadow-2xl rounded-lg overflow-hidden aspect-[3/4] bg-white transform transition-transform duration-500 group-hover:scale-[1.02]">
                  {book.coverUrl ? (
                    <img 
                      src={book.coverUrl} 
                      alt={book.title} 
                      className={`w-full h-full object-cover transition ${isSold ? "grayscale opacity-80" : ""}`} 
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                      <span className="text-6xl mb-4 opacity-50">📖</span>
                      <span className="font-medium tracking-widest uppercase text-xs">No Cover</span>
                    </div>
                  )}

                  {/* 已售出遮罩 (圖片上) */}
                  {isSold && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <div className="border-4 border-white px-6 py-2 transform -rotate-12 bg-black/50 backdrop-blur-sm">
                        <span className="text-white text-3xl font-black tracking-widest uppercase">SOLD OUT</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右側：資訊區 */}
            <div className="p-8 md:p-10 md:w-3/5 flex flex-col justify-between">
              <div>
                <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-start gap-4 mb-2">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight tracking-tight">
                    {book.title}
                  </h1>
                  
                  {/* 書況標籤 */}
                  <span className={`self-start px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border ${
                    book.condition === '全新' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    book.condition === '近全新' ? 'bg-sky-100 text-sky-700 border-sky-200' :
                    'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>{book.condition}</span>
                </div>
                
                <p className="text-lg text-slate-500 mb-8 font-medium flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-slate-300 inline-block"></span>
                  {book.authors.join(", ")}
                </p>
                
                {/* 價格與折數區 */}
                <div className="mb-8 inline-block">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-500 font-bold">NT$</span>
                    <span className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${isSold ? "from-gray-400 to-gray-600" : "from-blue-600 to-violet-600"}`}>
                      {book.price}
                    </span>
                    
                    {/* 顯示原價與折數 */}
                    {book.originalPrice && (
                      <div className="flex flex-col ml-2">
                        <span className="text-sm text-gray-400 line-through decoration-gray-300">原價 ${book.originalPrice}</span>
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                           {Math.round((book.price / book.originalPrice) * 100) / 10} 折
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 詳細資訊 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm text-slate-600 mb-8 bg-slate-50/80 p-6 rounded-2xl border border-slate-100">
                  <div className="space-y-1"><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">課程名稱</p><p className="font-semibold text-slate-800">{book.courseName || "—"}</p></div>
                  <div className="space-y-1"><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">授課教授</p><p className="font-semibold text-slate-800">{book.professor || "—"}</p></div>
                  <div className="space-y-1"><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">出版社</p><p className="font-semibold text-slate-800 truncate">{book.publisher || "—"}</p></div>
                  <div className="space-y-1"><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">ISBN</p><p className="font-mono font-semibold text-slate-800">{book.isbn}</p></div>
                  
                  {/* 筆記狀況 */}
                  <div className="space-y-1 md:col-span-2 border-t border-slate-200 pt-3 mt-1">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">筆記狀況</p>
                    <p className="font-semibold text-slate-800">{book.noteStatus || "賣家未說明"}</p>
                  </div>
                </div>
              </div>

              {/* 底部按鈕區 */}
              <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* 賣家資訊 */}
                <div className="flex items-center gap-4 group cursor-default">
                   <div className="relative">
                      <img src={book.seller.image || "/default-avatar.png"} alt="賣家" className="w-14 h-14 rounded-full border-4 border-white shadow-md object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                   </div>
                   <div>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Seller</p>
                     <p className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition">{book.seller.name || "匿名賣家"}</p>
                   </div>
                </div>

                {/* 根據狀態顯示不同按鈕 */}
                {isSold ? (
                  <button disabled className="flex-1 md:flex-none bg-gray-100 text-gray-400 px-8 py-4 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2 border border-gray-200">
                    🔒 此商品已售出
                  </button>
                ) : (
                  <ContactSellerButton sellerId={book.sellerId} bookTitle={book.title} />
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}