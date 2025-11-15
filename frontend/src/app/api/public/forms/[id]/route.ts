import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseFieldSettings } from '@/lib/field-settings';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const form = await prisma.form.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { message: 'Form not found' },
        { status: 404 }
      );
    }

    // Flatten settings for each field
    const fields = (form.fields ?? []).map((field) => {
      const settings = parseFieldSettings(field.settings)
      return {
        id: field.id,
        type: field.type,
        label: field.label,
        required: field.required,
        order: field.order,
        placeholder: settings.placeholder,
        helpText: settings.helpText,
        options: settings.options,
        min: settings.min,
        max: settings.max,
        validation: settings.validation,
      }
    })

    return NextResponse.json({
      id: form.id,
      name: form.name,
      description: form.description,
      fields,
      createdAt: form.createdAt,
    });
  } catch (error) {
    console.error('Get public form error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
