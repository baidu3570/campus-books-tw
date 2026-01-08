import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 🔍 共用檢查函式：確認使用者是這本書的主人
async function checkBookOwner(bookId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return null;

  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });
  
  if (!book || book.sellerId !== user.id) return null;

  return user;
}

// 👇 1. 處理 PATCH 請求 (修改狀態) - Next.js 15 版
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> } // 👈 注意這裡的型別變了
) {
  try {
    const params = await props.params; // 👈 關鍵：要先 await 才能拿到 id
    const user = await checkBookOwner(params.id);
    
    if (!user) {
      return NextResponse.json({ error: "無權限或找不到書籍" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    const updatedBook = await prisma.book.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("更新狀態失敗:", error);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}

// 👇 2. 處理 DELETE 請求 (刪除書籍) - Next.js 15 版
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> } // 👈 注意這裡的型別變了
) {
  try {
    const params = await props.params; // 👈 關鍵：要先 await 才能拿到 id
    const user = await checkBookOwner(params.id);

    if (!user) {
      return NextResponse.json({ error: "無權限或找不到書籍" }, { status: 403 });
    }

    await prisma.book.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "刪除成功" });
  } catch (error) {
    console.error("刪除失敗:", error);
    // 👇 這裡會印出真正的錯誤原因，方便除錯
    return NextResponse.json({ error: "刪除失敗，可能是資料庫錯誤" }, { status: 500 });
  }
}