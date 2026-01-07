"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import SearchBar from "./SearchBar"; // 👈 引入搜尋框

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/80">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center gap-4">
        
        {/* 1. LOGO */}
        <Link href="/" className="text-2xl font-black text-blue-600 tracking-tighter hover:text-blue-700 transition flex-shrink-0">
          CampusBooks TW
        </Link>

        {/* 2. 搜尋框 (只在電腦版顯示，透過 CSS hidden md:block 控制) */}
        <div className="flex-1 max-w-lg mx-4">
           <SearchBar />
        </div>

        {/* 3. 右側選單 */}
        <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
          <Link href="/sell" className="text-gray-600 hover:text-black font-medium transition text-sm hidden md:block">
            我要賣書
          </Link>

          {session ? (
            <div className="flex items-center gap-4">
              <Link 
                href="/chat" 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition relative"
                title="訊息中心"
              >
                <span className="text-xl">💬</span>
              </Link>

              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <Link href="/profile" className="flex items-center gap-2 group">
                  <img
                    src={session.user?.image || ""}
                    alt="User"
                    className="w-8 h-8 rounded-full border border-gray-200 group-hover:ring-2 ring-blue-500 transition"
                  />
                  <span className="font-bold text-sm text-gray-700 group-hover:text-black hidden md:block">
                    {session.user?.name}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-500 px-3 py-1.5 rounded-md transition hidden md:block"
                >
                  登出
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-black text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-800 transition shadow-lg shadow-gray-200"
            >
              登入
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}