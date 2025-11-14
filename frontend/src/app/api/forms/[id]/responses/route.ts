import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireAuth(user);

    const { id: formId } = await params;
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 25;
    const offset = (page - 1) * limit;

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: user.id, deletedAt: null },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    const [items, total] = await Promise.all([
      prisma.formResponse.findMany({
        where: { formId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.formResponse.count({ where: { formId, deletedAt: null } }),
    ]);

    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get responses error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
