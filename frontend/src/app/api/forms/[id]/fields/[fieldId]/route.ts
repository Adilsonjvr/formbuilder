import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireAuth } from '@/lib/auth';
import logger from '@/lib/logger';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireAuth(user);

    const { id: formId, fieldId } = await params;

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: user.id, deletedAt: null },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    await prisma.formField.delete({ where: { id: fieldId } });

    logger.info('field_deleted', { userId: user.id, formId, fieldId });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Delete field error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
