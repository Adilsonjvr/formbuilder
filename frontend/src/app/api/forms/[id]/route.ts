import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireAuth } from '@/lib/auth';
import logger from '@/utils/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireAuth(user);

    const { id } = await params;

    const form = await prisma.form.findFirst({
      where: {
        id: id,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        responses: true,
      },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    const stats = {
      responses: form.responses?.length ?? 0,
    };

    return NextResponse.json({
      id: form.id,
      name: form.name,
      description: form.description,
      fields: form.fields ?? [],
      isPublic: false,
      createdAt: form.createdAt,
      stats,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get form error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireAuth(user);

    const { id } = await params;
    const { name, description } = await req.json();

    const form = await prisma.form.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    const updated = await prisma.form.update({
      where: { id: form.id },
      data: { name: name ?? form.name, description: description ?? form.description },
    });

    logger.info('form_updated', { userId: user.id, formId: updated.id });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      createdAt: updated.createdAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Update form error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireAuth(user);

    const { id } = await params;

    const form = await prisma.form.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    await prisma.form.update({
      where: { id: form.id },
      data: { deletedAt: new Date() },
    });

    logger.info('form_deleted', { userId: user.id, formId: form.id });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Delete form error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
