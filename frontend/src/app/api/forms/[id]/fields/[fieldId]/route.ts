import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getAuthUser, requireAuth } from '@/lib/auth';
import logger from '@/lib/logger';
import { sanitizeFieldSettingsInput } from '@/lib/field-settings';
import { sanitizeRequiredString } from '@/lib/sanitize';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireAuth(user);

    const { id: formId, fieldId } = await params;
    const body = await req.json();
    const sanitizedLabel = body.label ? sanitizeRequiredString(body.label) : undefined;
    const rawSettings =
      body.settings ??
      (body.placeholder ||
      body.helpText ||
      body.options ||
      body.min !== undefined ||
      body.max !== undefined ||
      body.validation
        ? {
            placeholder: body.placeholder,
            helpText: body.helpText,
            options: body.options,
            min: body.min,
            max: body.max,
            validation: body.validation,
          }
        : undefined);
    const sanitizedSettings = sanitizeFieldSettingsInput(rawSettings);

    // Verify form ownership
    const form = await prisma.form.findFirst({
      where: { id: formId, userId: user.id, deletedAt: null },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    // Verify field belongs to form
    const existingField = await prisma.formField.findFirst({
      where: { id: fieldId, formId },
    });

    if (!existingField) {
      return NextResponse.json({ message: 'Field not found' }, { status: 404 });
    }

    // Update field
    const data: Prisma.FormFieldUpdateInput = {
      type: body.type ?? existingField.type,
      label: sanitizedLabel ?? existingField.label,
      required: body.required ?? existingField.required,
      order: body.order ?? existingField.order,
    }

    if (sanitizedSettings !== undefined) {
      data.settings = sanitizedSettings as Prisma.JsonValue
    }

    const updatedField = await prisma.formField.update({
      where: { id: fieldId },
      data,
    });

    logger.info('field_updated', { userId: user.id, formId, fieldId });

    return NextResponse.json(updatedField);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Update field error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

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
