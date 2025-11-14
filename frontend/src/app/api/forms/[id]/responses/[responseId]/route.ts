import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireAuth } from '@/lib/auth';
import logger from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireAuth(user);

    const { id: formId, responseId } = await params;

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: user.id, deletedAt: null },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    const response = await prisma.formResponse.findFirst({
      where: { id: responseId, formId, deletedAt: null },
    });

    if (!response) {
      return NextResponse.json({ message: 'Response not found' }, { status: 404 });
    }

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get response error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireAuth(user);

    const { id: formId, responseId } = await params;

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: user.id, deletedAt: null },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    await prisma.formResponse.update({
      where: { id: responseId },
      data: { deletedAt: new Date() },
    });

    logger.info('response_deleted', { formId, responseId });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Delete response error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
