import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
// 注意路徑：指到 auth 設定檔
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;
    const body = await request.json();
    
    // 👇 多接收一個 message 參數
    const { targetUserId, message } = body; 

    if (!targetUserId) {
      return NextResponse.json({ error: "缺少對方 ID" }, { status: 400 });
    }

    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: "不能跟自己聊天" }, { status: 400 });
    }

    // 1. 找房間
    let chatRoom = await prisma.chatRoom.findFirst({
      where: {
        AND: [
          { users: { some: { id: currentUserId } } },
          { users: { some: { id: targetUserId } } },
        ],
      },
      include: { users: true }
    });

    // 2. 沒房間就開新的
    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          users: {
            connect: [
              { id: currentUserId },
              { id: targetUserId },
            ],
          },
        },
        include: { users: true }
      });
    }

    // 👇 3. 關鍵功能：如果有帶入預設訊息，就幫忙發送！
    if (message) {
      await prisma.message.create({
        data: {
          content: message,
          chatRoomId: chatRoom.id,
          senderId: currentUserId,
        },
      });

      // 更新聊天室時間 (讓它浮到最上面)
      await prisma.chatRoom.update({
        where: { id: chatRoom.id },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({ chatRoomId: chatRoom.id });

  } catch (error) {
    console.error("開啟聊天室失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}