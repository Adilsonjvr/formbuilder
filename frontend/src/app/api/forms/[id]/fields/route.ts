import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { AddFormFieldDTO } from '@/lib/dtos/field.dto';
import logger from '@/lib/logger';
import { sanitizeFieldSettingsInput } from '@/lib/field-settings';
import { sanitizeRequiredString } from '@/lib/sanitize';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireAuth(user);

    const { id: formId } = await params;
    const body = await req.json();

    const validation = AddFormFieldDTO.safeParse(body);
    if (!validation.success) {
      const message = validation.error.issues.map((e) => e.message).join(', ');
      return NextResponse.json({ message }, { status: 400 });
    }

    const { type, required, order } = validation.data;
    const sanitizedLabel = sanitizeRequiredString(validation.data.label);
    const sanitizedSettings = sanitizeFieldSettingsInput(validation.data.settings);

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: user.id, deletedAt: null },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    const field = await prisma.formField.create({
      data: {
        formId,
        type,
        label: sanitizedLabel,
        required,
        order,
        settings: sanitizedSettings,
        createdAt: new Date(),
      },
    });

    logger.info('field_created', { userId: user.id, formId, fieldId: field.id });

    return NextResponse.json(field, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create field error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireAuth(user);

    const { id: formId } = await params;

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: user.id, deletedAt: null },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    const fields = await prisma.formField.findMany({
      where: { formId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(fields);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get fields error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
