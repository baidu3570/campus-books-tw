"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookUploadForm() {
  const router = useRouter();
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [bookData, setBookData] = useState({
    title: '',
    authors: '',
    publisher: '',
    publishedDate: '',
    price: '',
    condition: '九成新',
    courseName: '',
    professor: '',
    coverUrl: '',
    description: ''
  });

  const handleLookup = async () => {
    if (!isbn) return alert("請輸入 ISBN！");
    setLoading(true);

    try {
      const res = await fetch(`/api/books/lookup?isbn=${isbn}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "搜尋失敗");

      setBookData(prev => ({
        ...prev,
        title: data.title,
        authors: data.authors.join(', '),
        publisher: data.publisher,
        publishedDate: data.publishedDate,
        coverUrl: data.thumbnail,
        description: data.description
      }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!bookData.title || !bookData.price) {
      return alert("請至少填寫書名和售價！");
    }
    setSubmitting(true);

    try {
      const res = await fetch('/api/books/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bookData, isbn }),
      });

      if (!res.ok) throw new Error('上架失敗');
      alert('🎉 上架成功！');
      router.push('/');

    } catch (error) {
      alert('發生錯誤，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="輸入 ISBN (例如: 9789861371955)"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 min-w-[100px]"
        >
          {loading ? '搜尋中...' : '自動帶入'}
        </button>
      </div>

      {bookData.coverUrl && (
        <div className="flex justify-center mb-6">
          <img src={bookData.coverUrl} alt="封面" className="h-40 shadow-md rounded" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-full">
          <label className="block text-sm text-gray-600 mb-1">書名</label>
          <input type="text" value={bookData.title} onChange={(e)=>setBookData({...bookData, title: e.target.value})} className="w-full p-2 border rounded bg-gray-50" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">作者</label>
          <input type="text" value={bookData.authors} onChange={(e)=>setBookData({...bookData, authors: e.target.value})} className="w-full p-2 border rounded bg-gray-50" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">出版社</label>
          <input type="text" value={bookData.publisher} onChange={(e)=>setBookData({...bookData, publisher: e.target.value})} className="w-full p-2 border rounded bg-gray-50" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">出版日期</label>
          <input type="text" value={bookData.publishedDate} onChange={(e)=>setBookData({...bookData, publishedDate: e.target.value})} className="w-full p-2 border rounded bg-gray-50" />
        </div>

        {/* 課程資訊 */}
        <div className="col-span-full border-t pt-4 mt-2">
           <h3 className="text-sm font-bold text-gray-800 mb-3">🎓 課程資訊 (方便同學搜尋)</h3>
           <div className="grid grid-cols-2 gap-4">
             <input placeholder="課程名稱 (例如: 經濟學)" className="p-2 border rounded" value={bookData.courseName} onChange={(e)=>setBookData({...bookData, courseName: e.target.value})} />
             <input placeholder="教授姓名 (例如: 王大明)" className="p-2 border rounded" value={bookData.professor} onChange={(e)=>setBookData({...bookData, professor: e.target.value})} />
           </div>
        </div>

        {/* 售價 */}
        <div className="col-span-full border-t pt-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1 font-bold text-blue-700">欲售價格 (TWD)</label>
              <input type="number" className="w-full p-2 border-2 border-blue-100 rounded focus:border-blue-500" placeholder="請輸入售價" value={bookData.price} onChange={(e)=>setBookData({...bookData, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">書況</label>
              <select className="w-full p-2 border rounded" value={bookData.condition} onChange={(e)=>setBookData({...bookData, condition: e.target.value})}>
                <option value="全新">全新</option>
                <option value="九成新">九成新</option>
                <option value="有劃記">有劃記</option>
                <option value="略有破損">略有破損</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={submitting}
        className="w-full mt-8 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400"
      >
        {submitting ? '資料上架中...' : '確認上架'}
      </button>
    </div>
  );
}