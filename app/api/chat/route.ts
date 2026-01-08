import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 👇 GET: 取得我的聊天列表 (這部分維持原樣)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. 找到我 (User)
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 2. 找出所有「有我參與」的聊天室
    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        users: {
          some: { id: currentUser.id }, // 只要成員裡有我就算
        },
      },
      include: {
        users: true, // 把聊天對象的資料也抓出來
        messages: {  // 抓最後一則訊息 (用來顯示預覽)
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" }, // 最近有聊天的排前面
    });

    return NextResponse.json(chatRooms);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// 👇 POST: 開啟新聊天室 (🔥 升級版：支援預設訊息)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();
    const { sellerId, message } = body; // 👈 多接收 message 這個參數

    if (!sellerId) return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
    
    // 🛡️ 防止自己跟自己聊天
    if (sellerId === currentUser.id) {
      return NextResponse.json({ error: "不能跟自己聊天" }, { status: 400 });
    }

    // 1. 檢查是否已經有這兩個人的聊天室了
    let chatRoom = await prisma.chatRoom.findFirst({
      where: {
        AND: [
          { users: { some: { id: currentUser.id } } },
          { users: { some: { id: sellerId } } },
        ],
      },
    });

    // 2. 如果沒有，就創建一個新的，並把「預設訊息」塞進去
    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          users: {
            connect: [
              { id: currentUser.id },
              { id: sellerId },
            ],
          },
          // 👇 這裡就是升級的關鍵！順便建立第一則訊息
          messages: message ? {
            create: {
              content: message,
              senderId: currentUser.id,
            }
          } : undefined
        },
      });
    }

    // 3. 回傳聊天室 ID (讓前端轉址過去)
    return NextResponse.json({ chatRoomId: chatRoom.id });

  } catch (error) {
    console.error("建立聊天室失敗:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}