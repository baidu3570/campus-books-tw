import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers'; // 引入剛剛做的元件
import Navbar from '@/components/Navbar'; // 等一下要做這個

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CampusBooks TW',
  description: '全台大學生專屬二手書交易平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <Providers>
          {/* 放一個導覽列在最上面，這樣每一頁都有 */}
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}