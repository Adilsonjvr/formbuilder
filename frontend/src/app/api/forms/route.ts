import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { CreateFormDTO } from '@/lib/dtos/form.dto';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    requireAuth(user);

    const body = await req.json();
    const validation = CreateFormDTO.safeParse(body);

    if (!validation.success) {
      const message = validation.error.issues.map((e) => e.message).join(', ');
      return NextResponse.json({ message }, { status: 400 });
    }

    const { name, description } = validation.data;

    const form = await prisma.form.create({
      data: {
        name,
        description,
        userId: user.id,
      },
    });

    logger.info('form_created', { userId: user.id, formId: form.id, name: form.name });

    return NextResponse.json(
      {
        id: form.id,
        name: form.name,
        description: form.description,
        createdAt: form.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create form error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    requireAuth(user);

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.form.findMany({
        where: {
          userId: user.id,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          _count: {
            select: {
              responses: true,
            },
          },
        },
      }),
      prisma.form.count({
        where: {
          userId: user.id,
          deletedAt: null,
        },
      }),
    ]);

    const hasMore = page * limit < total;

    return NextResponse.json({ items, total, page, limit, hasMore });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get forms error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
