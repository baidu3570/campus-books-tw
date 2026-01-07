"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ChatRoom {
  id: string;
  updatedAt: string;
  users: {
    id: string;
    name: string;
    image: string | null;
  }[];
  messages: {
    content: string;
    createdAt: string;
  }[];
}

export default function ChatListPage() {
  const { data: session } = useSession();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch("/api/chat/list");
        if (res.ok) {
          const data = await res.json();
          setChatRooms(data);
        }
      } catch (error) {
        console.error("載入失敗", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchChats();
    }
  }, [session]);

  if (!session) return <div className="p-10 text-center">請先登入查看訊息</div>;

  const currentUserId = (session.user as any).id;

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">📬 訊息中心</h1>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">載入中...</div>
      ) : chatRooms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-xl mb-2">📭</p>
          <p className="text-gray-500">目前沒有任何訊息</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chatRooms.map((room) => {
            // 找出「對方」是誰 (過濾掉我自己)
            const otherUser = room.users.find((u) => u.id !== currentUserId) || room.users[0];
            const lastMessage = room.messages[0];

            return (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="block bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition group"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={otherUser.image || "/default-avatar.png"}
                    alt={otherUser.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition">
                        {otherUser.name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {lastMessage ? new Date(lastMessage.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {lastMessage ? lastMessage.content : "尚無訊息"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}