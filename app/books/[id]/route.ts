import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // 確保路徑對應你的專案
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 處理 DELETE 請求 (刪除書籍)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 檢查登入狀態
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "尚未登入" }, { status: 401 });
    }

    // 2. 找到使用者 ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "找不到使用者" }, { status: 404 });
    }

    // 3. 檢查這本書是不是這個人賣的 (安全性檢查！)
    const book = await prisma.book.findUnique({
      where: { id: params.id },
    });

    if (!book) {
      return NextResponse.json({ error: "找不到這本書" }, { status: 404 });
    }

    if (book.sellerId !== user.id) {
      return NextResponse.json({ error: "你無權刪除這本書" }, { status: 403 });
    }

    // 4. 執行刪除
    await prisma.book.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "刪除成功" });
  } catch (error) {
    console.error("刪除失敗:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}