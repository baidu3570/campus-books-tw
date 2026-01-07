import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
// 👇 注意路徑：回到 api 層找到 auth
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { chatRoomId, content } = await request.json();
    const userId = (session.user as any).id;

    if (!content.trim()) {
      return NextResponse.json({ error: "訊息不能為空" }, { status: 400 });
    }

    // 1. 建立訊息
    const message = await prisma.message.create({
      data: {
        content,
        chatRoomId,
        senderId: userId,
      },
      include: {
        sender: {
          select: { name: true, image: true },
        },
      },
    });

    // 2. 更新聊天室的 "updatedAt"，這樣聊天列表才會跳到最上面
    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);

  } catch (error) {
    console.error("發送訊息失敗:", error);
    return NextResponse.json({ error: "發送失敗" }, { status: 500 });
  }
}