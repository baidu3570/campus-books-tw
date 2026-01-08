import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> } // Next.js 15 寫法
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 1. 檢查我是否在這個聊天室內 (安全性檢查)
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: params.id },
      include: { users: true },
    });

    if (!chatRoom || !chatRoom.users.some(u => u.id === currentUser.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. 抓取這個房間的訊息
    const messages = await prisma.message.findMany({
      where: { chatRoomId: params.id },
      orderBy: { createdAt: "asc" }, // 舊的在上面
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}