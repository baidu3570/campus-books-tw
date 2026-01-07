"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
}

export default function ChatRoomPage() {
  const { data: session } = useSession();
  const params = useParams(); 
  const chatRoomId = params.id as string;
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null); 

  // 1. 定期抓取新訊息 (每 3 秒一次)
  useEffect(() => {
    if (!chatRoomId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/${chatRoomId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("讀取訊息失敗", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatRoomId]);

  // 2. 自動捲動到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. 發送訊息
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatRoomId,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage(""); 
        const updatedRes = await fetch(`/api/chat/${chatRoomId}`);
        const updatedData = await updatedRes.json();
        setMessages(updatedData);
      }
    } catch (error) {
      alert("發送失敗");
    } finally {
      setIsSending(false);
    }
  };

  if (!session) return <div className="p-10 text-center">請先登入...</div>;

  const currentUserId = (session.user as any).id;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-white border-b px-4 py-3 flex items-center shadow-sm sticky top-0 z-10">
        <Link href="/" className="text-gray-500 hover:text-black mr-4 text-sm">
          ← 回首頁
        </Link>
        <h1 className="font-bold text-lg">💬 聊天室</h1>
      </div>

      {/* 訊息顯示區 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <img
                  src={msg.sender.image || "/default-avatar.png"}
                  className="w-8 h-8 rounded-full mr-2 self-end border border-gray-200"
                  alt="Avatar"
                />
              )}
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                }`}
              >
                {msg.content}
                <div className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 底部輸入框 */}
      <div className="bg-white p-4 border-t sticky bottom-0">
        <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="輸入訊息..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-md"
          >
            發送
          </button>
        </form>
      </div>
    </div>
  );
}