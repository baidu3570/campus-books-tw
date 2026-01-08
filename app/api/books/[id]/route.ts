import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 🔍 共用檢查函式：確認使用者是這本書的主人
// 回傳：User 物件 (如果是主人) 或 null (如果不合法)
async function checkBookOwner(bookId: string) {
  const session = await getServerSession(authOptions);
  // 1. 檢查登入 (用 Email 最穩)
  if (!session || !session.user?.email) return null;

  // 2. 找到真正的 User ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return null;

  // 3. 檢查書是不是這個人賣的
  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });
  
  // 書不存在，或是賣家ID不符，都回傳 null
  if (!book || book.sellerId !== user.id) return null;

  return user; // 回傳使用者資料，代表驗證通過
}

// 👇 1. 處理 PATCH 請求 (修改狀態：已售出 / 上架中)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 呼叫上面的共用檢查
    const user = await checkBookOwner(params.id);
    if (!user) {
      return NextResponse.json({ error: "無權限或找不到書籍" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body; // 前端會傳來 { status: "SOLD" } 或 "ON_SALE"

    // 更新資料庫
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

// 👇 2. 處理 DELETE 請求 (刪除書籍)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
    return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
  }
}