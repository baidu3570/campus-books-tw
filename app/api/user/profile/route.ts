import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
// 👇 建議改用 @ 開頭的絕對路徑，比較不會因為檔案搬家而找不到
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // 👇 檢查 email 是否存在，比較保險
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const body = await request.json();
    const { university } = body;

    const updatedUser = await prisma.user.update({
      // ✅ 改用 email 來找人，這最穩！
      where: { email: session.user.email },
      data: { university: university || null },
    });

    return NextResponse.json({ message: "更新成功", user: updatedUser });

  } catch (error) {
    console.error("更新失敗:", error);
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}