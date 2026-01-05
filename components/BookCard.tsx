import Link from 'next/link';
import { type Book } from "@prisma/client";

export default function BookCard({ book }: { book: Book }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col h-full">
      <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden group">
        {book.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="h-full w-full object-cover group-hover:scale-105 transition duration-300" 
          />
        ) : (
          <div className="text-gray-400 text-sm">無封面</div>
        )}
        <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {book.condition}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {book.courseName && (
          <div className="mb-2">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              📚 {book.courseName}
            </span>
          </div>
        )}

        <h3 className="font-bold text-gray-800 line-clamp-2 mb-1 min-h-[3rem]">
          {book.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-1">
          {book.authors.join(', ')}
        </p>

        <div className="mt-auto flex items-end justify-between border-t pt-3">
          <div>
            <span className="text-lg font-bold text-green-600">
              ${book.price}
            </span>
            {/* 原價顯示已移除 */}
          </div>
          
          <Link href={`/books/${book.id}`}>
            <button className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition">
              查看
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}