// 檔案位置: app/sell/page.tsx
import BookUploadForm from '@/components/BookUploadForm';

export default function SellPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          上架你的二手書
        </h1>
        <p className="text-center text-gray-500 mb-8">
          輸入 ISBN，我們幫你自動填寫資料
        </p>
        
        {/* 這裡就是我們剛剛寫的那個元件 */}
        <BookUploadForm />
      </div>
    </div>
  );
}