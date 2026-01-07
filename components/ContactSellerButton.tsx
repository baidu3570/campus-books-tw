"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

interface Props {
  sellerId: string;
  bookTitle: string;
}

export default function ContactSellerButton({ sellerId, bookTitle }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleContact = async () => {
    // 1. 沒登入先登入
    if (!session) {
      if (confirm("請先登入才能聯絡賣家，要現在登入嗎？")) {
        signIn("google");
      }
      return;
    }

    // 2. 不能跟自己聊
    if ((session.user as any).id === sellerId) {
      alert("這是你自己的書啦！不用跟自己聊天 😂");
      return;
    }

    setIsLoading(true);

    try {
      // 👇 3. 準備好「預設訊息」
      const firstMessage = `你好，我想詢問關於《${bookTitle}》這本書，請問還有貨嗎？`;

      // 4. 呼叫後端 API
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          targetUserId: sellerId,
          message: firstMessage // 👈 把這句話傳給後端
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "發生錯誤");
      }

      // 5. 跳轉到聊天室
      router.push(`/chat/${data.chatRoomId}`);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleContact}
      disabled={isLoading}
      className="flex-1 md:flex-none text-center bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          連線中...
        </>
      ) : (
        <>
          💬 私訊賣家
        </>
      )}
    </button>
  );
}