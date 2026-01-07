import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
// 👇 改用這種路徑，保證找得到朋友
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const body = await request.json();
    const { university } = body;

    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { university: university || null },
    });

    return NextResponse.json({ message: "更新成功", user: updatedUser });

  } catch (error) {
    console.error("更新失敗:", error);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}