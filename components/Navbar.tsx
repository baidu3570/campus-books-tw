"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, Suspense } from "react";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Logo 區域 */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
            <span className="text-2xl">📚</span>
            <span className="font-black text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-indigo-600 group-hover:to-blue-600 transition-all">
              CampusBooks
            </span>
          </Link>

          {/* 🔍 中間搜尋框 */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <Suspense fallback={<div className="w-full h-10 bg-gray-100 rounded-xl animate-pulse" />}>
              <SearchBar />
            </Suspense>
          </div>

          {/* 右側選單 (桌面版) */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/sell" 
              className="font-bold text-gray-600 hover:text-blue-600 transition flex items-center gap-1"
            >
              <span>💰</span> 我要賣書
            </Link>
            
            {session ? (
              <div className="flex items-center gap-4">
                <Link href="/chat" className="relative p-2 text-gray-500 hover:text-blue-600 transition hover:bg-blue-50 rounded-full" title="我的訊息">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </Link>
                
                {/* 👇 修改重點：把頭像和名字包在 Link 裡 */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <Link href="/profile" className="flex-shrink-0 group" title="前往賣家中心">
                    <img 
                      src={session.user?.image || "https://ui-avatars.com/api/?name=User"} 
                      alt="User" 
                      className="w-8 h-8 rounded-full border border-gray-200 group-hover:ring-2 group-hover:ring-blue-500 transition"
                    />
                  </Link>
                  <div className="flex flex-col">
                    <Link href="/profile" className="text-sm font-bold text-gray-700 hover:text-blue-600 transition">
                      {session.user?.name}
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className="text-xs text-red-500 hover:text-red-700 text-left font-medium"
                    >
                      登出
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-black text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-800 transition shadow-lg shadow-gray-200/50"
              >
                登入 / 註冊
              </button>
            )}
          </div>

          {/* 手機版漢堡選單按鈕 */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <span className="text-xl">☰</span>
          </button>
        </div>
      </div>

      {/* 手機版下拉選單 */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 space-y-4 shadow-xl">
          <div className="mb-4">
            <Suspense fallback={<div className="w-full h-10 bg-gray-100 rounded-xl animate-pulse" />}>
              <SearchBar />
            </Suspense>
          </div>
          
          <Link href="/sell" className="block w-full text-center py-3 font-bold text-gray-700 bg-gray-50 rounded-xl">
            💰 我要賣書
          </Link>

          {session ? (
            <div className="space-y-3">
              <Link href="/chat" className="block w-full text-center py-3 font-bold text-blue-600 bg-blue-50 rounded-xl">
                💬 我的訊息
              </Link>
              
              {/* 👇 手機版也加上連結 */}
              <div className="flex items-center justify-center gap-3 pt-3 border-t">
                <Link href="/profile" className="flex items-center gap-3 group">
                  <img src={session.user?.image || ""} className="w-8 h-8 rounded-full border border-gray-200" />
                  <span className="font-bold text-gray-800 group-hover:text-blue-600">{session.user?.name}</span>
                </Link>
                <button onClick={() => signOut()} className="text-red-500 text-sm font-bold bg-red-50 px-3 py-1 rounded-lg">登出</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="w-full bg-black text-white py-3 rounded-xl font-bold"
            >
              Google 登入
            </button>
          )}
        </div>
      )}
    </nav>
  );
}