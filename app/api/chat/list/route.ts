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

    const currentUserId = (session.user as any).id;

    // 抓取我有參與的聊天室
    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        users: {
          some: { id: currentUserId }, // 成員包含我
        },
      },
      orderBy: {
        updatedAt: "desc", // 最新的聊天排前面
      },
      include: {
        users: {
          select: { id: true, name: true, image: true },
        },
        messages: {
          take: 1, // 只抓最後一則訊息 (用來顯示預覽)
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(chatRooms);
  } catch (error) {
    console.error("讀取列表失敗", error);
    return NextResponse.json({ error: "讀取失敗" }, { status: 500 });
  }
}