import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";

export default async function ChatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  // 1. 找到我
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) redirect("/");

  // 2. 抓取聊天室與訊息
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: params.id },
    include: {
      users: true,
      messages: {
        orderBy: { createdAt: "asc" }, // 舊訊息在上面
        include: {
            sender: { select: { id: true, name: true, image: true } }
        }
      },
    },
  });

  // 3. 安全檢查
  if (!chatRoom || !chatRoom.users.some(u => u.id === currentUser.id)) {
    return notFound();
  }

  // 4. 找出「對方」是誰
  const otherUser = chatRoom.users.find(u => u.id !== currentUser.id) || currentUser;

  // 5. 轉換資料格式 (避免日期物件傳遞錯誤)
  const formattedMessages = chatRoom.messages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt.toISOString()
  }));

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-xl min-h-screen md:min-h-[600px] md:my-8 md:rounded-2xl overflow-hidden border border-gray-100">
      <ChatWindow 
        chatRoomId={chatRoom.id}
        initialMessages={formattedMessages}
        currentUser={currentUser}
        otherUser={otherUser}
      />
    </div>
  );
}