import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get('isbn');

  if (!isbn) return NextResponse.json({ error: '請輸入 ISBN' }, { status: 400 });

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: '找不到這本書' }, { status: 404 });
    }

    const bookInfo = data.items[0].volumeInfo;

    // 只回傳我們需要的資料
    const result = {
      title: bookInfo.title || '',
      authors: bookInfo.authors || [],
      publisher: bookInfo.publisher || '無',
      publishedDate: bookInfo.publishedDate || '無',
      description: bookInfo.description || '',
      thumbnail: bookInfo.imageLinks?.thumbnail || '',
    };

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({ error: '連線錯誤' }, { status: 500 });
  }
}