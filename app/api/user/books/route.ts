import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    // 找出所有 "sellerId" 等於 "目前登入者ID" 的書
    const myBooks = await prisma.book.findMany({
      where: {
        sellerId: (session.user as any).id,
      },
      orderBy: {
        createdAt: 'desc', // 最新的書排前面
      },
    });

    return NextResponse.json(myBooks);
  } catch (error) {
    return NextResponse.json({ error: "讀取失敗" }, { status: 500 });
  }
}