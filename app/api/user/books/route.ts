import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
// 👇 建議改用絕對路徑
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    // 1. 先用 Email 找到真正的 User 資料 (為了拿到 ID)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "找不到使用者" }, { status: 404 });
    }

    // 2. 用真正的 ID 去找書
    const myBooks = await prisma.book.findMany({
      where: {
        sellerId: user.id, // ✅ 這裡用查出來的 id，絕對不會錯！
      },
      orderBy: {
        createdAt: 'desc', // 最新的書排前面
      },
    });

    return NextResponse.json(myBooks);
  } catch (error) {
    console.error("讀取賣場失敗:", error);
    return NextResponse.json({ error: "讀取失敗" }, { status: 500 });
  }
}