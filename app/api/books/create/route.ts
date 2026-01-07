import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
// 👇 請確認這個路徑是否正確指向你的 auth 設定檔
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    // 1. 檢查登入
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "請先登入才能賣書" }, { status: 401 });
    }

    // 2. 取得資料
    const body = await request.json();
    const { 
      isbn, title, authors, publisher, publishedDate, 
      description, coverUrl, price, condition, 
      courseName, professor,
      originalPrice, noteStatus // 👈 新增這兩個欄位
    } = body;

    // 3. 寫入資料庫
    const newBook = await prisma.book.create({
      data: {
        isbn,
        title,
        // 強制轉成陣列，避免前端傳來字串導致錯誤
        authors: Array.isArray(authors) ? authors : [authors],
        publisher,
        publishedDate,
        description,
        coverUrl: coverUrl || "", // 如果沒圖片就給空字串
        price: Number(price),
        condition,
        courseName,
        professor,
        sellerId: (session.user as any).id, // 連結到賣家

        // 👇 處理新欄位：轉數字或給預設值
        originalPrice: originalPrice ? Number(originalPrice) : null,
        noteStatus: noteStatus || "賣家未說明",
      },
    });

    return NextResponse.json(newBook);
    
  } catch (error) {
    console.error("上架失敗:", error);
    return NextResponse.json({ error: "上架失敗，請稍後再試" }, { status: 500 });
  }
}