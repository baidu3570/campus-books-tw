import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }
    const { id } = await params; 
    const messages = await prisma.message.findMany({
      where: { chatRoomId: id },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "讀取失敗" }, { status: 500 });
  }
}