import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // 1. 檢查有沒有登入
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 找到使用者
    const currentUser = await prisma.user.findUnique({ 
        where: { email: session.user.email } 
    });
    
    if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { chatRoomId, content } = body;

    // 3. 寫入訊息到資料庫
    const newMessage = await prisma.message.create({
      data: {
        content,
        chatRoomId,
        senderId: currentUser.id,
      },
    });

    // 4. 更新聊天室的「最後更新時間」(讓它浮到列表最上面)
    await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(newMessage);

  } catch (error) {
    console.error("發送失敗:", error);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}