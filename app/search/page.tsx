import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BookCard from "@/components/BookCard";

// 強制動態渲染，確保搜尋結果是最新的
export const dynamic = "force-dynamic";

export default async function SearchPage(
  props: { searchParams: Promise<{ q: string }> }
) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">請輸入關鍵字搜尋</h1>
        <Link href="/" className="text-blue-600 hover:underline">回首頁</Link>
      </div>
    );
  }

  const books = await prisma.book.findMany({
    where: {
      AND: [
        { status: "ON_SALE" }, // 只找上架中的
        {
          OR: [
            { title: { contains: query, mode: "insensitive" } },      // 找書名
            { description: { contains: query, mode: "insensitive" } }, // 找描述
            
            // 👇👇👇 修正這裡！把 authors 改成 author 👇👇👇
            { author: { contains: query, mode: "insensitive" } },      // 找作者
            
            { courseName: { contains: query, mode: "insensitive" } },  // 找課程
            { professor: { contains: query, mode: "insensitive" } },   // 找教授
            { isbn: { contains: query, mode: "insensitive" } },        // 找 ISBN
          ],
        },
      ],
    },
    include: {
      seller: {
        select: { name: true, image: true, university: true },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">
        " {query} " 的搜尋結果
        <span className="text-base font-normal text-gray-500 ml-4">
          (共 {books.length} 筆)
        </span>
      </h1>

      {books.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-6xl mb-4">😭</p>
          <h2 className="text-xl font-bold text-gray-700">找不到相關書籍</h2>
          <p className="text-gray-500 mt-2">試試看其他關鍵字吧！</p>
          <Link href="/" className="inline-block mt-4 bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800">
            回首頁瀏覽
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}