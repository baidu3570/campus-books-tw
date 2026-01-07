import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
// 👇 路徑指到 auth 設定檔
import { authOptions } from "../../auth/[...nextauth]/route";

// 1. 刪除書籍 (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;

    // 檢查書籍是否存在
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return NextResponse.json({ error: "找不到書籍" }, { status: 404 });
    }

    // 檢查是否為本人
    if (book.sellerId !== userId) {
      return NextResponse.json({ error: "你無權刪除這本書" }, { status: 403 });
    }

    // 執行刪除
    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ message: "刪除成功" });

  } catch (error) {
    console.error("刪除失敗:", error);
    return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
  }
}

// 2. 更新書籍狀態 (PATCH) - 例如：標示為已售出
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;
    const body = await request.json();
    const { status } = body; // 預期收到 "SOLD" 或 "ON_SALE"

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return NextResponse.json({ error: "找不到書籍" }, { status: 404 });
    }

    if (book.sellerId !== userId) {
      return NextResponse.json({ error: "你無權修改這本書" }, { status: 403 });
    }

    // 更新資料庫
    const updatedBook = await prisma.book.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedBook);

  } catch (error) {
    console.error("更新失敗:", error);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}