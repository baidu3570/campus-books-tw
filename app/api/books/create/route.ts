import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@campus.tw' },
      update: {},
      create: {
        email: 'demo@campus.tw',
        name: '測試賣家',
        isStudentVerified: true,
      },
    });

    const newBook = await prisma.book.create({
      data: {
        isbn: body.isbn,
        title: body.title,
        authors: body.authors.split(',').map((a: string) => a.trim()),
        publisher: body.publisher,
        publishedDate: body.publishedDate,
        description: body.description,
        coverUrl: body.coverUrl,
        price: parseInt(body.price) || 0,
        // originalPrice 已經刪除了，這裡不用再寫
        condition: body.condition,
        courseName: body.courseName,
        professor: body.professor,
        tradeMethod: ['面交'],
        sellerId: demoUser.id,
      },
    });

    return NextResponse.json({ success: true, bookId: newBook.id });

  } catch (error) {
    console.error('上架失敗:', error);
    return NextResponse.json({ error: '存檔失敗' }, { status: 500 });
  }
}