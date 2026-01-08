import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const body = await request.json();
    
    // 👇👇👇 關鍵修正：這裡一定要把 isbn 拿出來！ 👇👇👇
    const { 
      isbn,  // 👈 補上這個，下面的紅色波浪線就會消失了
      title, author, price, condition, 
      courseName, coverUrl, description,
      originalPrice, noteStatus, professor 
    } = body;

    // 必填檢查
    if (!title || !price || !condition) {
      return NextResponse.json({ error: "缺少必填欄位" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "找不到使用者" }, { status: 404 });
    }

    // 2. 寫入資料庫
    const newBook = await prisma.book.create({
      data: {
        isbn: isbn || "N/A", // 這裡現在讀得到上面的 isbn 變數了
        title,
        // 相容性處理：不管前端傳陣列還是字串都能存
        author: Array.isArray(author) ? author.join(", ") : (author || "未知作者"),
        price: Number(price),
        condition,
        courseName: courseName || null,
        coverUrl: coverUrl || null,
        description: description || "",
        status: "ON_SALE",
        sellerId: user.id,

        // 新欄位
        originalPrice: originalPrice ? Number(originalPrice) : null,
        noteStatus: noteStatus || null,
        professor: professor || null,
      },
    });

    return NextResponse.json(newBook);
  } catch (error) {
    console.error("上架失敗:", error);
    return NextResponse.json({ error: "上架失敗，資料庫欄位錯誤" }, { status: 500 });
  }
}