"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface Props {
  chatRoomId: string;
  initialMessages: Message[]; // 從伺服器先帶下來的舊訊息
  currentUser: User;          // 當前使用者的資料
  otherUser: User;            // 對方的資料
}

export default function ChatWindow({ chatRoomId, initialMessages, currentUser, otherUser }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 1. 自動捲動到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. 定期抓取新訊息 (每 3 秒)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/${chatRoomId}`);
        if (res.ok) {
          const data = await res.json();
          // 比對長度，只有當訊息變多時才更新 (避免畫面一直閃)
          setMessages(prev => {
            if (data.length > prev.length) return data;
            return prev;
          });
        }
      } catch (error) {
        console.error("讀取訊息失敗", error);
      }
    };

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatRoomId]);

  // 3. 發送訊息
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const tempMsg = newMessage;
    setNewMessage(""); // 先清空讓體驗更好

    try {
      // ✅ 改成呼叫我們新建的 /api/messages
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatRoomId,
          content: tempMsg,
        }),
      });

      if (res.ok) {
        const savedMsg = await res.json();
        // 直接把回傳的新訊息塞進去，不用等下一次 Polling
        setMessages(prev => [...prev, {
            ...savedMsg,
            sender: currentUser // 手動補上 sender 資訊讓畫面顯示正確
        }]);
      } else {
        setNewMessage(tempMsg); // 失敗補回文字
        alert("發送失敗");
      }
    } catch (error) {
      setNewMessage(tempMsg);
      alert("發送失敗");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-white border-b px-4 py-3 flex items-center shadow-sm sticky top-0 z-10 justify-between">
        <div className="flex items-center gap-3">
            <Link href="/profile" className="text-gray-500 hover:text-black">
            ← 返回
            </Link>
            <div className="flex items-center gap-2">
                <img src={otherUser.image || "https://ui-avatars.com/api/?name=User"} className="w-8 h-8 rounded-full border" />
                <h1 className="font-bold text-lg">{otherUser.name}</h1>
            </div>
        </div>
      </div>

      {/* 訊息顯示區 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <img
                  src={msg.sender.image || "https://ui-avatars.com/api/?name=User"}
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