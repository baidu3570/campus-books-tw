"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Book {
  id: string;
  title: string;
  price: number;
  condition: string;
  coverUrl: string | null;
  createdAt: string;
  status: string; // 👈 新增狀態
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [university, setUniversity] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    if (status === "authenticated") fetchMyBooks();
  }, [status, router]);

  const fetchMyBooks = async () => {
    try {
      const res = await fetch("/api/user/books");
      if (res.ok) {
        const data = await res.json();
        setMyBooks(data);
      }
    } catch (error) {
      console.error("無法載入賣場", error);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university }),
      });
      if (res.ok) setMsg({ text: "🎉 資料更新成功！", type: "success" });
    } catch (error) {
      setMsg({ text: "發生錯誤", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // 👇 新增：切換書籍狀態 (已售出 <-> 架上)
  const handleToggleStatus = async (bookId: string, currentStatus: string) => {
    const newStatus = currentStatus === "SOLD" ? "ON_SALE" : "SOLD";
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // 更新前端狀態
        setMyBooks(prev => prev.map(book => 
          book.id === bookId ? { ...book, status: newStatus } : book
        ));
      }
    } catch (error) {
      alert("狀態更新失敗");
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("確定要永久刪除這本書嗎？建議改為「已售出」即可保留紀錄。")) return;
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      if (res.ok) {
        setMyBooks(prev => prev.filter(book => book.id !== bookId));
        alert("刪除成功！");
      }
    } catch (error) {
      alert("發生錯誤");
    }
  };

  if (status === "loading") return <div className="p-10 text-center">載入中...</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">賣家中心</h1>
        <div className="grid lg:grid-cols-12 gap-8">
          {/* 左側個人資料 (維持原樣) */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
              <div className="text-center mb-6">
                <img src={session?.user?.image || ""} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg" />
                <h2 className="font-bold text-2xl">{session?.user?.name}</h2>
                <p className="text-gray-500">{session?.user?.email}</p>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <input type="text" value={university} onChange={e => setUniversity(e.target.value)} placeholder="就讀大學" className="w-full p-3 border rounded-xl" />
                {msg.text && <p className={`text-center text-sm ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>}
                <button disabled={isSaving} className="w-full bg-black text-white py-3 rounded-xl font-bold">更新資料</button>
              </form>
            </div>
          </div>

          {/* 右側賣場列表 */}
          <div className="lg:col-span-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[600px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">📚 我的書庫 <span className="text-gray-400 text-sm">({myBooks.length})</span></h2>
                <Link href="/sell" className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-700">+ 上架新書</Link>
              </div>

              <div className="space-y-4">
                {myBooks.map((book) => (
                  <div key={book.id} className={`flex gap-5 p-4 rounded-2xl border transition ${book.status === 'SOLD' ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-100 hover:shadow-md'}`}>
                    <div className="w-20 h-28 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden relative">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Cover</div>}
                      
                      {/* 已售出遮罩 */}
                      {book.status === 'SOLD' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold text-xs border border-white px-1 py-0.5 rounded">SOLD</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="font-bold text-gray-800 line-clamp-1">{book.title}</h3>
                          {book.status === 'SOLD' && <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">已售出</span>}
                        </div>
                        <p className="text-blue-600 font-bold mt-1">NT$ {book.price}</p>
                      </div>

                      <div className="flex justify-end gap-3 mt-2">
                        {/* 👇 切換狀態按鈕 */}
                        <button 
                          onClick={() => handleToggleStatus(book.id, book.status)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition ${
                            book.status === 'SOLD' 
                              ? 'border-blue-200 text-blue-600 hover:bg-blue-50' 
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {book.status === 'SOLD' ? '🔄 重新上架' : '🤝 標示為已售出'}
                        </button>
                        
                        <button onClick={() => handleDeleteBook(book.id)} className="text-red-400 hover:text-red-600 px-2 text-sm">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}