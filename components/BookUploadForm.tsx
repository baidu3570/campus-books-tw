"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// ==========================================
// 👇 已經幫你填好你的 Cloudinary 資料了！
// ==========================================
const CLOUDINARY_CLOUD_NAME = "dltyducdd"; 
const CLOUDINARY_UPLOAD_PRESET = "upload_safe";
// ==========================================

interface FormData {
  isbn: string;
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  description: string;
  coverUrl: string;
  price: string;
  condition: string;
  courseName: string;
  professor: string;
  originalPrice: string;
  noteStatus: string;
}

export default function BookUploadForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false); // 圖片上傳狀態
  const [msg, setMsg] = useState("");

  const [formData, setFormData] = useState<FormData>({
    isbn: "",
    title: "",
    authors: [],
    publisher: "",
    publishedDate: "",
    description: "",
    coverUrl: "",
    price: "",
    condition: "九成新",
    courseName: "",
    professor: "",
    originalPrice: "",
    noteStatus: "",
  });

  // 處理圖片上傳 (傳送到 Cloudinary)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    setMsg("⏳ 圖片上傳中...");

    const formDataObj = new FormData();
    formDataObj.append("file", file);
    formDataObj.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      console.log("正在上傳到:", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
      
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formDataObj,
        }
      );

      const data = await res.json();
      
      // 👇 這裡會把真正的錯誤原因抓出來顯示！
      if (data.error) {
        alert(`❌ Cloudinary 錯誤: ${data.error.message}`);
        setMsg(`❌ 上傳失敗: ${data.error.message}`);
        return;
      }

      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, coverUrl: data.secure_url }));
        setMsg("✅ 圖片上傳成功！");
      } else {
        throw new Error("未預期的回應格式");
      }
    } catch (error: any) {
      console.error("圖片上傳錯誤:", error);
      alert(`❌ 發生錯誤: ${error.message}`);
      setMsg("❌ 圖片上傳失敗，請檢查網路或設定");
    } finally {
      setUploadingImg(false);
    }
  };
  // 自動帶入 ISBN 資料
  const handleAutoFill = async () => {
    if (!formData.isbn) return;
    setLoading(true);
    try {
      // ✅ 改成這樣 (把 books/lookup 換成 check)
      const res = await fetch(`/api/check?isbn=${formData.isbn}`);
      if (!res.ok) throw new Error("找不到這本書");
      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        title: data.title || "",
        authors: data.authors || [],
        publisher: data.publisher || "",
        publishedDate: data.publishedDate || "",
        description: data.description || "",
        coverUrl: data.imageLinks?.thumbnail || "",
      }));
      setMsg("✅ 自動帶入成功！");
    } catch (error) {
      setMsg("❌ 找不到書籍資料，請手動輸入");
    } finally {
      setLoading(false);
    }
  };

  // 送出表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!session) {
      alert("請先登入");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/books/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("🎉 上架成功！");
        router.push("/"); 
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`上架失敗: ${errorData.error}`);
      }
    } catch (error) {
      alert("發生錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
      <h2 className="text-3xl font-black text-center mb-8 text-gray-800">上架你的二手書</h2>
      
      {/* ISBN 自動帶入區塊 */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-700 mb-2">1. 快速輸入 (ISBN)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.isbn}
            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            placeholder="輸入 ISBN 自動帶入資料..."
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none font-mono"
          />
          <button
            type="button"
            onClick={handleAutoFill}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
          >
            自動帶入
          </button>
        </div>
        {msg && <p className={`text-sm mt-2 font-medium animate-pulse ${msg.includes('❌') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 圖片上傳區塊 (Cloudinary) */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-2">2. 書況照片 (封面)</label>
          <div className="flex items-start gap-4">
            {/* 預覽圖 */}
            <div className="w-24 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 border border-gray-300 relative">
              {formData.coverUrl ? (
                <img src={formData.coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <span className="text-2xl">📷</span>
                  <span className="text-[10px]">無圖片</span>
                </div>
              )}
              {uploadingImg && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                  上傳中...
                </div>
              )}
            </div>

            {/* 上傳按鈕 */}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImg}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2 cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                💡 點擊上方按鈕上傳實拍照片。<br/>
                (如果自動帶入已有圖片，你上傳後會覆蓋掉原本的圖片)
              </p>
            </div>
          </div>
        </div>

        {/* 基本資料區 */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-700">3. 詳細資料</label>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">書名</label>
            <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded-lg" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">作者</label>
              <input type="text" value={formData.authors.join(", ")} onChange={(e) => setFormData({ ...formData, authors: e.target.value.split(",").map(s => s.trim()) })} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">出版社</label>
              <input type="text" value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
        </div>

        {/* 課程資訊 */}
        <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="col-span-2 text-sm font-bold text-blue-800">🎓 這是哪堂課的書？</div>
          <input type="text" placeholder="課程名稱 (如: 經濟學)" value={formData.courseName} onChange={(e) => setFormData({ ...formData, courseName: e.target.value })} className="w-full p-2 border rounded-lg" />
          <input type="text" placeholder="教授姓名 (如: 王大明)" value={formData.professor} onChange={(e) => setFormData({ ...formData, professor: e.target.value })} className="w-full p-2 border rounded-lg" />
        </div>

        <hr className="border-gray-100" />

        {/* 售價與書況 */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">💰 欲售價格</label>
              <input required type="number" placeholder="$" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full p-3 border rounded-xl text-lg font-bold text-blue-600" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">書本原價</label>
              <input type="number" placeholder="$" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
            </div>
          </div>

          {/* 自動計算折數提示 */}
          {formData.price && formData.originalPrice && (
            <div className="text-right text-sm font-bold text-green-600 bg-green-50 p-2 rounded-lg inline-block float-right">
              💡 這樣約等於 {Math.round((Number(formData.price) / Number(formData.originalPrice)) * 100) / 10} 折
            </div>
          )}
          <div className="clear-both"></div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">書況</label>
              <select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white">
                <option value="全新">✨ 全新</option>
                <option value="近全新">🌟 近全新 (翻過幾次)</option>
                <option value="九成新">📖 九成新 (無明顯摺痕)</option>
                <option value="八成新">📚 八成新 (有使用痕跡)</option>
                <option value="七成新">📦 七成新 (保存良好)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">內頁劃記</label>
              <select value={formData.noteStatus} onChange={(e) => setFormData({ ...formData, noteStatus: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white">
                <option value="">請選擇...</option>
                <option value="全新未拆">✨ 全新未拆</option>
                <option value="無劃記">📄 完全無劃記</option>
                <option value="少許劃記">✏️ 少許鉛筆/螢光筆</option>
                <option value="筆記豐富">📝 筆記豐富 (考前救星)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || uploadingImg}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "處理中..." : uploadingImg ? "圖片上傳中..." : "確認上架"}
        </button>
      </form>
    </div>
  );
}